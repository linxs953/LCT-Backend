import { Controller, Get, HttpStatus, Logger, Post, Query } from "@nestjs/common";
import {TaskService } from "./task.service";
import { APITEST_CONFIG } from "../apitest.config";
import { Body, Delete, Res } from "@nestjs/common/decorators";
import { FeatMKService } from "../featMK/featMK.service";
import {CaseStatics, TaskRunRecordParser} from "./task.utils"
import {ApiRunVO, CreateTaskRelationVO, CreateTaskVO, DeleteTaskVO, FindAllSceneOfTaskVO, FindTaskRelationVO, StartTaskVO, TaskRelationRecord, UpdateTaskRelationVO, UpdateTaskVO} from "./task.vo"
import { TaskInfoDto, TaskRelationDto, TaskRelationUpdataDto, UpdateTaskDto } from "./task.dto";
import { Prisma } from "@prisma/client";
import { SceneService } from "../scene/scene.service";
const random = require("string-random")
var sd = require('silly-datetime');


@Controller(`${APITEST_CONFIG.routePrefix}/taskService`)
export class TaskController {
    private readonly taskLogger:Logger
    constructor (
        private readonly taskService:TaskService,
        private readonly mkService:FeatMKService,
        private readonly sceneService:SceneService
    ) {
        this.taskLogger = new Logger(TaskController.name)
    }

    @Get("getAllScene")
    async getAllScene(@Query() reqParam, @Res() _res) {
        const taskId = reqParam.taskId
        this.taskLogger.debug(`start get allScene with [taskId=${taskId}]`)
        let getAllSceneVO:FindAllSceneOfTaskVO = {
            status: 0,
            isSuccess: true,
            message: "",
            data: {}
        }
        try {
            const res = await this.taskService.findMany(taskId)
            if (res.error) {
                getAllSceneVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
                getAllSceneVO['errMsg'] = res.error.message
                _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(getAllSceneVO)
                return
            }
            getAllSceneVO['message'] = `get all scene with [taskId=${taskId}] successfully`
            getAllSceneVO['data'] = res.data
            _res.status(HttpStatus.OK).send(getAllSceneVO)
            return
        } catch(err) {
            this.taskLogger.error(err,"")
            getAllSceneVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            getAllSceneVO['errMsg'] = "get task case error"
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(getAllSceneVO)
            return
        }
    }

    @Get(`getResult`)
    async getApiRunResult(@Query() query) {
        const detailId = query.runId
        const sceneId = query.sceneId
        this.taskLogger.debug(`find API_RUN_RESULT by [runId=${detailId}, sceneId=${sceneId}]`)
        let status_ = await this.taskService.getStatus(detailId)

        let taskRunResultVO:ApiRunVO = {
            status: 0,
            isSuccess: true,
            message: "",
            data: {
                taskRunList: [],
                taskRunSceneList: [],
                taskRunInfo: undefined
            }
        }

        // 获取任务运行记录失败，在service层做了try catch，这里判断是否有error就行
        if (status_.error) {
            this.taskLogger.error(`find API_RUN_RESULT null with [runId=${detailId}]`,"")
            taskRunResultVO['status'] = HttpStatus.BAD_REQUEST
            taskRunResultVO['isSuccess'] = false
            taskRunResultVO['message'] = `not found API_RUN_RESULT with [runId=${detailId}] for ${status_.error.message}`
            taskRunResultVO['data'] = null
            return taskRunResultVO
        }
        const errorDetail = status_['failed_result'] == "{}" ? null:JSON.parse(status_['failed_result'])
        const runResultDetail = status_['run_result'] == "{}" ? null:JSON.parse(status_['run_result'])
        let taskRunSceneInfoList = []
        let allSceneData = []

        // 统计有多少个场景，按照场景的执行成功还是失败，取相对应的字段
        let sceneNameList:any
        if (Object.keys(errorDetail).length > Object.keys(runResultDetail).length) {
            sceneNameList = Object.keys(errorDetail)
        } else {
            sceneNameList = Object.keys(runResultDetail)
        }

        // 调用任务运行日志解析器
        const parseResult = TaskRunRecordParser.recordParse({
                error: errorDetail,
                result: runResultDetail,
                nameList: sceneNameList,
            },
            {
                sceneInfoList: taskRunSceneInfoList,
                allSceneList: allSceneData
            },
            [
                sceneId
            ]
        )

        taskRunSceneInfoList = parseResult['sceneInfoList']
        allSceneData = parseResult['allSceneList']
        taskRunResultVO['isSuccess'] = true
        taskRunResultVO['message'] = "fetch task run record successfully"
        taskRunResultVO['status'] = HttpStatus.OK
        taskRunResultVO['data'] = {
            taskRunInfo: {
                taskId: status_.data.task_id,
                taskRunId: detailId,
                taskStatus: status_['status'],
                taskRunName: status_['task_run_name'],
                totalNum: status_['all_case_num'],
                successNum: status_['exec_success_num'],
                failedNum: status_['exec_failed_num'],
                executedNum: status_['exec_finished_num'],
                createTime: status_['create_time']
            },
            taskRunSceneList: taskRunSceneInfoList,
            taskRunList: allSceneData,
        }
        return taskRunResultVO
    }

    @Post(`start`)
    async start(@Query() query, @Res() _res) {
        this.taskLogger.debug(`process start task with [taskId=${query.taskId}]`)
        let startTaskVO:StartTaskVO = {
            status: 0,
            isSuccess: true,
            message: "",
            logId: ""
        }
        try {
            const logId = String("DTL" + random(10)).toUpperCase()
            let taskInfo = await this.taskService.findTaskInfoByTaskId(query.taskId)
            let taskRelation = await this.taskService.findTaskRelationByTaskId(query.taskId)
            if (taskInfo.error) {
                startTaskVO['status'] = HttpStatus.BAD_REQUEST
                startTaskVO['errMsg'] = taskInfo.error.message
                startTaskVO['isSuccess'] = false
                _res.status(HttpStatus.BAD_REQUEST).send(startTaskVO)
                return
            }
            if (taskRelation.error) {
                startTaskVO['status'] = HttpStatus.BAD_REQUEST
                startTaskVO['errMsg'] = taskRelation.error.message
                startTaskVO['isSuccess'] = false
                _res.status(HttpStatus.BAD_REQUEST).send(startTaskVO)
                return
            }

            // todo: 后期taskService.runTask调整之后需要进行异常错误处理，并去除try catch
            const taskPromiseList = await this.taskService.runTask(query.taskId,logId,taskRelation.data,taskInfo.data)
            Promise.all(taskPromiseList).catch(err => {
                this.taskLogger.error("run promise scene error","")
                this.taskLogger.error(JSON.stringify(err),"")
            })
            startTaskVO['message'] = "dispatch task successfully"
            startTaskVO['logId'] = logId
            startTaskVO['isSuccess'] = true
            startTaskVO['status'] = HttpStatus.OK
            _res.status(HttpStatus.OK).send(startTaskVO)
            return
        } catch (err) {
            this.taskLogger.error(err.stack,"")
            startTaskVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            startTaskVO['isSuccess'] = false
            startTaskVO['errMsg'] = err.message
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(startTaskVO)
            return
        }
    }
    

    @Post(`newTask`)
    async createTask(@Res() _res, @Body() taskDto:TaskInfoDto) {
        const taskInfo:Prisma.at_task_infoCreateInput = {
            task_id: `TASK${random(10)}`,
            task_name: taskDto.task_name,
            run_env: taskDto.run_env,
            is_enable: taskDto.is_enable,
            auto_run_enable: taskDto.auto_run_enable,
            create_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm'),
            modify_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm'),
            create_person: "admin",
            modify_person: "admin"
        }
        let createTaskVO:CreateTaskVO = {
            status: 0,
            isSuccess: true,
            data: {
                task_id: ""
            },
        }
        const res  = await this.taskService.createTaskInfo(taskInfo)
        if (res.error) {
            createTaskVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            createTaskVO['isSuccess'] = false
            createTaskVO['errMsg'] = res.error.message
            createTaskVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(createTaskVO)
            return
        }
        createTaskVO['status'] = HttpStatus.OK
        createTaskVO['isSuccess'] = true
        createTaskVO['message'] = "create task successfully"
        createTaskVO['data'] = {
            task_id: res.data.task_id
        }
        _res.status(HttpStatus.OK).send(createTaskVO)
        return
    }

    @Post(`updateTask`)
    async updateTask(@Body() updateTaskDto:UpdateTaskDto, @Res() _res) {
        let updateTaskVO:UpdateTaskVO = {
            status: 0,
            isSuccess: false,
            message: ""
        }
        const res = await this.taskService.updateTaskInfo(updateTaskDto.condition, updateTaskDto.data)
        if (res.error) {
            updateTaskVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            updateTaskVO['isSuccess'] = false
            updateTaskVO['errMsg'] = res.error.message
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(updateTaskVO)
            return
        }
        updateTaskVO['status'] = HttpStatus.OK
        updateTaskVO['isSuccess'] = true
        updateTaskVO['message'] = "update task info succesfully"
        _res.status(HttpStatus.OK).send(updateTaskVO)
        return
    }

    @Delete(`deleteTask`)
    async deleteTask(@Query() query, @Res() _res) {
        const taskId = query.taskId
        let deleteTaskVO:DeleteTaskVO = {
            status: 0,
            isSuccess: false,
        }
        if (!taskId) {
            deleteTaskVO['status'] = HttpStatus.BAD_REQUEST
            deleteTaskVO['isSuccess'] = false
            deleteTaskVO['errMsg'] = "task id is invalid"
            _res.status(HttpStatus.BAD_REQUEST).send(deleteTaskVO)
            return 
        }
        const result = await this.taskService.deleteTaskInfo(taskId)
        if (result.error) {
            deleteTaskVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            deleteTaskVO['isSuccess'] = false
            deleteTaskVO['errMsg'] = result.error.message
            _res.status(HttpStatus.OK).send(deleteTaskVO)
            return
        }
        deleteTaskVO['status'] = HttpStatus.OK
        deleteTaskVO['isSuccess'] = true
        deleteTaskVO['message'] = "delete task successfully"
        _res.status(HttpStatus.OK).send(deleteTaskVO)
        return
    }


    @Post(`createRelation`)
    async relateTaskWithModule(@Body() taskRelation:TaskRelationDto, @Res() _res) {
        let dataList = []
        let createRelationVO:CreateTaskRelationVO = {
            status: 0,
            isSuccess: false,
        }
        if (taskRelation.moduleIdList && taskRelation.sceneIdList) {
            // 不能同时指定模块和场景
            this.taskLogger.error("no support assign module_id and scene_id at the same time","")
            createRelationVO['status'] = HttpStatus.BAD_REQUEST
            createRelationVO['isSuccess'] = false
            createRelationVO['errMsg'] = "assign module_id and scene_id at the same time"
            createRelationVO['data'] = null
            _res.status(HttpStatus.BAD_REQUEST).send(createRelationVO)
            return
        }
        
        if (taskRelation.moduleIdList && taskRelation.moduleIdList.length === 0 && !taskRelation.sceneIdList) {
            createRelationVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            createRelationVO['isSuccess'] = false
            createRelationVO['errMsg'] = "module id list no data"
            createRelationVO['data'] = {
                taskType: taskRelation.taskType
            }
            _res.status(HttpStatus.OK).send(createRelationVO)
            return
        }

        if (taskRelation.sceneIdList && !taskRelation.moduleIdList && taskRelation.sceneIdList.length === 0) {
            createRelationVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            createRelationVO['isSuccess'] = false
            createRelationVO['errMsg'] = "scene id list no data"
            createRelationVO['data'] = {
                taskType: taskRelation.taskType
            }
            _res.status(HttpStatus.OK).send(createRelationVO)
            return
        }

        // 设置遍历的数组
        if (taskRelation.taskType === "1" ) {
            dataList = taskRelation.moduleIdList
        } else {
            dataList = taskRelation.sceneIdList
        }

        for (let Id of dataList) {
            let taskRelationCreateInput:Prisma.at_task_model_relationCreateInput = {
                id: `RELATE${random(10)}`,
                task_id: taskRelation.taskId,
                task_type: "1",
                module_id: "",
                scene_id: "",
                create_person: "admin",
                create_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm'),
                modify_person: "admin",
                modify_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm')
            }

            // 根据任务类型，设置relation的moduleid 或者 sceneid
            if (taskRelation.taskType === "1") {
                taskRelationCreateInput['module_id'] = Id
            } else {
                taskRelationCreateInput['scene_id'] = Id
            }
            const createRelationRs = await this.taskService.createTaskRelation(taskRelationCreateInput)
            if (createRelationRs.error) {
                this.taskLogger.error(`create task relation failed for error ${createRelationRs.error.message}\n, start delete task relation with taskId: ${taskRelation.taskId}`,"")
                const removeRelationRs = await this.taskService.removeTaskRelation(taskRelation.taskId)
                
                // 创建失败，删除task对应的relation失败
                if (removeRelationRs.error) {
                    this.taskLogger.error(`remove task relation with taskId: ${taskRelation.taskId} failed for ${removeRelationRs.error.message}`)
                    createRelationVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
                    createRelationVO['isSuccess'] = false
                    createRelationVO['errMsg'] = removeRelationRs.error.message
                    createRelationVO['data'] = {
                            taskType: taskRelation.taskType
                    }
                    _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(createRelationVO)
                    return 
                }

                // 创建失败，删除task对应的relation成功
                this.taskLogger.log(`remove task relation with taskId: ${taskRelation.taskId} successfully`)
                createRelationVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
                createRelationVO['isSuccess'] = false
                createRelationVO['errMsg'] = createRelationRs.error.message
                createRelationVO['data'] = {
                    taskType: taskRelation.taskType
                }
                _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(createRelationVO)
                return
            }
            
            // 创建relation成功
            createRelationVO['status'] = HttpStatus.OK
            createRelationVO['message'] = "create task relation successfully"
            createRelationVO['isSuccess'] = true
            createRelationVO['data'] = {
                taskType: taskRelation.taskType
            }
            _res.status(HttpStatus.OK).send(createRelationVO)
            return 
        }
    }


    // todo: 考虑后面把for循环调用service移到service内部处理
    @Post("updateRelation")
    async updateTaskRelation(@Body() updateRelationDto:TaskRelationUpdataDto, @Res() _res) {
        let updateVO:UpdateTaskRelationVO = {
            status: 0,
            isSuccess: false
        }
        switch(updateRelationDto.taskType) {
            case "1": {
                if ((!updateRelationDto.moduleIdList || updateRelationDto.moduleIdList.length === 0)){
                    updateVO['status'] = HttpStatus.BAD_REQUEST
                    updateVO['isSuccess'] = false
                    updateVO['errMsg'] = "taskType->1 but moduleIdList invalid"
                    _res.status(HttpStatus.BAD_REQUEST).send(updateVO)
                    return
                }
                break
            }
            case "2": {
                if (!updateRelationDto.sceneIdList || updateRelationDto.sceneIdList.length === 0) {
                    updateVO['status'] = HttpStatus.BAD_REQUEST
                    updateVO['isSuccess'] = false
                    updateVO['errMsg'] = "taskType->2 but sceneIdList invalid"
                    _res.status(HttpStatus.BAD_REQUEST).send(updateVO)
                    return 
                }
                break
            }
            default: {
                updateVO['status'] = HttpStatus.BAD_REQUEST
                updateVO['isSuccess'] = false
                updateVO['errMsg'] = "unsupported taskType"
                _res.status(HttpStatus.BAD_REQUEST).send(updateVO)
                return
            }
        }


        let idList = updateRelationDto.taskType === "1"?updateRelationDto.moduleIdList:updateRelationDto.sceneIdList

        for (let idStr of idList) {
            const conditon:Prisma.at_task_model_relationWhereUniqueInput = {
                task_id: updateRelationDto.taskId,
                id: updateRelationDto.relationId
            }
            
            let data:Prisma.at_task_model_relationUpdateInput = {
                task_type: updateRelationDto.taskType,
                modify_person: "admin",
                modify_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm')
            }
            if (updateRelationDto.taskType === "1") {
                data['module_id'] = idStr
            } else {
                data['scene_id'] = idStr
            }
            const updateRelationRs = await this.taskService.updateTaskRelation(conditon, data)    
            if (updateRelationRs.error) {
                updateVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
                updateVO['isSuccess'] = false
                updateVO['message'] = `update relation failed with [taskId=${updateRelationDto.taskId},relationId=${updateRelationDto.relationId}]`
                _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(updateVO)
                return
            }
        }
        updateVO['status'] = HttpStatus.OK
        updateVO['isSuccess'] = true
        updateVO['message'] = "update relation successfully"
        _res.status(HttpStatus.OK).send(updateVO)
        return
    }

    @Delete("deleteRelation")
    async deleteTaskRelation(@Query() query, @Res() _res) {
        const taskId = query.taskId
        let deleteVO:DeleteTaskVO = {
            status: 0,
            isSuccess: false
        }
        if (!taskId) {
            deleteVO['status'] = HttpStatus.BAD_REQUEST
            deleteVO['isSuccess'] = false
            deleteVO['errMsg'] = "taskId is invalid"
            _res.status(HttpStatus.BAD_REQUEST).send(deleteVO)
            return
        }
        const rmTaskRelationRs = await this.taskService.removeTaskRelation(taskId)
        if (rmTaskRelationRs.error) {
            deleteVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            deleteVO['isSuccess'] = false
            deleteVO['errMsg'] = `delete relation failed for ${rmTaskRelationRs.error.message}`
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(deleteVO)
            return
        }
        deleteVO['status'] = HttpStatus.OK
        deleteVO['isSuccess'] = true
        deleteVO['message'] = "delete relation successfully"
        _res.status(HttpStatus.OK).send(deleteVO)
        return
      
    }

    @Get("getRelation")
    async getTaskRelations (@Query() query, @Res() _res) {
        const taskId = query.taskId
        let taskRelationVO:FindTaskRelationVO = {
            data: [],
            status: 0,
            isSuccess: true
        }
        try {
            const res = await this.taskService.findRelation(taskId)
            if (res.error) {
                taskRelationVO['status'] = HttpStatus.BAD_REQUEST
                taskRelationVO['isSuccess'] = false
                taskRelationVO['errMsg'] = res.error.message
                _res.status(HttpStatus.BAD_REQUEST).send(taskRelationVO)
                return 
            }
            let records = []
            for (let d of res.data) {
                let record:TaskRelationRecord = {
                    taskId: d.task_id,
                    taskType: d.task_type,
                }
                const moduleInfo = await this.mkService.findById(d.module_id)
                const sceneInfo = await this.sceneService.findById(d.scene_id)
                if (moduleInfo.error) {
                    taskRelationVO['status'] = HttpStatus.BAD_REQUEST
                    taskRelationVO['isSuccess'] = false
                    taskRelationVO['errMsg'] = moduleInfo.error.message
                    _res.status(HttpStatus.BAD_REQUEST).send(taskRelationVO)
                    return
                }
                if (sceneInfo.error) {
                    taskRelationVO['status'] = HttpStatus.BAD_REQUEST
                    taskRelationVO['isSuccess'] = false
                    taskRelationVO['errMsg'] = sceneInfo.error.message
                    _res.status(HttpStatus.BAD_REQUEST).send(taskRelationVO)
                    return 
                }
                d.task_type === "1"?record['moduleId'] = d.module_id:record['sceneId'] = d.scene_id
                d.task_type === "1"?record['moduleName'] = moduleInfo.data.module_name:record['sceneName'] = sceneInfo.data.scene_name
                records.push(record)
            }
            taskRelationVO['data'] = records
            _res.status(HttpStatus.OK).send(taskRelationVO)
            return
        } catch(err) {
            this.taskLogger.error(`get relation with [taskId=${taskId}] occur error`,"")
            taskRelationVO['errMsg'] = err.message
            taskRelationVO['isSuccess'] = false
            taskRelationVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(taskRelationVO)
            return
        }
    }
} 