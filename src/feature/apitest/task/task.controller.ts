import { Controller, Get, HttpStatus, Logger, Post, Query } from "@nestjs/common";
import {TaskService } from "./task.service";
import { APITEST_CONFIG } from "../apitest.config";
import { Body, Delete, Res } from "@nestjs/common/decorators";
import { FeatMKService } from "../featMK/featMK.service";
// import { getErrorNum, getSceneCaseNum } from "./utils/case_statics";
import {CaseStatics} from "./task.utils"
import {ApiRunVO, CreateTaskVO, DeleteTaskVO, FindAllSceneOfTaskVO, FindTaskRelationVO, StartTaskVO, TaskRelationRecord, UpdateTaskRelationVO, UpdateTaskVO} from "./task.vo"
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
            getAllSceneVO['data'] = res
            getAllSceneVO['message'] = `get all scene with [taskId=${taskId}] successfully`
            _res.status(HttpStatus.OK).send(getAllSceneVO)
            return
            // this.taskService.findMany(taskId).then(res => {
            //     this.taskLogger.debug(`get scene data.\nsceneData: ${JSON.stringify(res)}`)
            //     _res.status(HttpStatus.OK).send({
            //         status: HttpStatus.OK,
            //         isSuccess: true,
            //         data: res
            //     })
            //     return
            // }).catch(err => {
            //     this.taskLogger.error(err.stack,"")
            //     _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
            //         status: HttpStatus.INTERNAL_SERVER_ERROR,
            //         isSuccess: false,
            //         error: err.message
            //     })
            //     return
            // })
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
        const status_ = await this.taskService.getStatus(detailId)
        if (!status_) {
            this.taskLogger.error(`find API_RUN_RESULT null with [runId=${detailId}]`,"")
            const _:ApiRunVO = {
                isSuccess: false,
                message: `not found API_RUN_RESULT with [runId=${detailId}]`,
                data: null,
                status: 0
            }
            return _
        }
        const errorDetail = status_['failed_result'] == "{}" ? null:JSON.parse(status_['failed_result'])
        const runResultDetail = status_['run_result'] == "{}" ? null:JSON.parse(status_['run_result'])
        let taskRunSceneInfoList = []
        let allSceneData = []
        // 统计有多少个场景

        let sceneNameList:any
        if (Object.keys(errorDetail).length > Object.keys(runResultDetail).length) {
            sceneNameList = Object.keys(errorDetail)
        } else {
            sceneNameList = Object.keys(runResultDetail)
        }

        for (let scene of sceneNameList) {
            let allCaseNumOfScene = CaseStatics.getSceneCaseNum(errorDetail,scene)
            // 如果执行成功，拿runResultDetail
            allCaseNumOfScene = allCaseNumOfScene?allCaseNumOfScene:CaseStatics.getSceneCaseNum(runResultDetail,scene)
            const sceneFailedNum = CaseStatics.getErrorNum(errorDetail, scene)
            const sceneSuccessNum = allCaseNumOfScene - sceneFailedNum            
            taskRunSceneInfoList.push({
                sceneName: scene,
                execSuccessNum: sceneSuccessNum,
                execFailNum: sceneFailedNum,
                sceneTotalNum: allCaseNumOfScene,
                runStatus: sceneFailedNum > 0?false:true
            })

            let caseList:any
            if (Object.keys(errorDetail[scene]).length > Object.keys(runResultDetail[scene]).length) {
                caseList = Object.keys(errorDetail[scene])
            } else {
                caseList = Object.keys(runResultDetail[scene])
            }

            for (let caseName of caseList) {
                const stage =  (errorDetail[scene][caseName]&&Object.keys(errorDetail[scene][caseName]).length>0)?
                                    Object.keys(errorDetail[scene][caseName]).toString():
                                    "success"
                let errorInfo = (errorDetail[scene][caseName]&&errorDetail[scene][caseName])?
                                    errorDetail[scene][caseName][stage]:
                                    null
                const resultInfo =  (runResultDetail[scene][caseName]&&runResultDetail[scene][caseName])?
                                    runResultDetail[scene][caseName]:
                                    null
                if (errorInfo) {
                    switch(typeof(errorInfo['resp'])) {
                        // 结果是字符串，可能出现在预处理阶段
                        case "string": {
                            errorInfo = errorInfo['resp']
                            break
                        }
                        // 结果是对象，可能出现在请求阶段getResponse或者在verify阶段
                        case "object": {
                            if (errorInfo['resp']['error']) {
                                errorInfo = errorInfo['resp']['error']['result']
                            } else {
                                // 断言失败
                                errorInfo = errorInfo['assertFailDetail']
                            }
                            break
                        }
                    }
                } else {
                    errorInfo = null
                }

                const runStatus = errorInfo?false:true

                // 组装场景运行结果taskRunList
                const stepResult =  {
                    sceneName: scene,
                    stepName: caseName,
                    runStatus: runStatus,
                    stage: stage,
                    error: errorInfo,
                    result: resultInfo&&resultInfo['response']?
                                resultInfo['response']:
                                ((resultInfo&&resultInfo['error']['result'])?
                                resultInfo['error']['result']:resultInfo)
                }
                allSceneData.push(stepResult)
            }
            
        }
        
        const res:ApiRunVO = {
            isSuccess: true,
            message: "fetch task run record successfully",
            data: {
                taskRunList: allSceneData,
                taskRunSceneList: taskRunSceneInfoList,
                taskRunInfo: {
                    taskId: status_.task_id,
                    taskRunId: detailId,
                    taskStatus: status_['status'],
                    taskRunName: status_['task_run_name'],
                    totalNum: status_['all_case_num'],
                    successNum: status_['exec_success_num'],
                    failedNum: status_['exec_failed_num'],
                    executedNum: status_['exec_finished_num'],
                    createTime: status_['create_time']
                },
            },
            status: 0
        }
        return res
    }

    @Post(`start`)
    async start(@Query() query, @Res() _res) {
        this.taskLogger.debug(`process start task with [taskId=${query.taskId}]`)
        try {
            const logId = String("DTL" + random(10)).toUpperCase()
            let taskInfo = await this.taskService.findTaskInfoByTaskId(query.taskId)
            let taskRelation = await this.taskService.findTaskRelationByTaskId(query.taskId)
            const taskPromiseList = await this.taskService.runTask(query.taskId,logId,taskRelation,taskInfo)
            Promise.all(taskPromiseList).catch(err => {
                this.taskLogger.error("run promise scene error","")
                this.taskLogger.error(JSON.stringify(err),"")
            })
            const tresp:StartTaskVO = {
                status: HttpStatus.OK,
                isSuccess: true,
                logId: logId,
                message: "dispatch task successfully"
            }
            _res.status(HttpStatus.OK).send(tresp)
            return
        } catch (err) {
            this.taskLogger.error(err.stack,"")
            const tresp:StartTaskVO = {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                isSuccess: false,
                errMsg: err.message,
            }
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(tresp)
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
        try {
            const res  = await this.taskService.createTaskInfo(taskInfo)
            const createTaskVO:CreateTaskVO = {
                status: 0,
                isSuccess: true,
                message: "create task successfully",
                data: {
                    task_id: res.task_id
                }
            }
            _res.status(HttpStatus.OK).send(createTaskVO)
            return
        } catch(err) {
            const createTaskVO:CreateTaskVO = {
                status: 500,
                isSuccess: false,
                errMsg: err.message,
                data: null
            }
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(createTaskVO)
            return
        }
        
    }

    @Post(`updateTask`)
    async updateTask(@Body() updateTaskDto:UpdateTaskDto, @Res() _res) {
        try {
            const res = await this.taskService.updateTaskInfo(updateTaskDto.condition, updateTaskDto.data)
            const updateTaskVO:UpdateTaskVO = {
                status: 0,
                isSuccess: true,
                message: "update task info succesfully"
            }
            _res.status(HttpStatus.OK).send(updateTaskVO)
            return
        } catch(err) {
            const updateTaskVO:UpdateTaskVO = {
                status: 500,
                isSuccess: false,
                message: err.message
            }
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(updateTaskVO)
            return
        }
    }

    @Delete(`deleteTask`)
    async deleteTask(@Query() query, @Res() _res) {
        const taskId = query.taskId
        if (!taskId) {
            const deleteTaskVO:DeleteTaskVO = {
                status: 0,
                isSuccess: false,
                errMsg: "task id is invalid"
            }
            _res.status(HttpStatus.BAD_REQUEST).send(deleteTaskVO)
            return 
        }
        try {
            await this.taskService.deleteTaskInfo(taskId)
            const deleteTaskVO:DeleteTaskVO = {
                status: 0,
                isSuccess: true,
                message: "delete task successfully"
            }
            _res.status(HttpStatus.OK).send(deleteTaskVO)
            return
        } catch(err) {
            const deleteTaskVO:DeleteTaskVO = {
                status: 500,
                isSuccess: false,
                errMsg: err.message
            }
            _res.status(HttpStatus.OK).send(deleteTaskVO)
            return
        }        
    }


    @Post(`createRelation`)
    async relateTaskWithModule(@Body() taskRelation:TaskRelationDto, @Res() _res) {
        let dataList = []
        if (taskRelation.moduleIdList && taskRelation.sceneIdList) {
            // 不能同时指定模块和场景
            this.taskLogger.error("no support assign module_id and scene_id at the same time","")
            _res.status(HttpStatus.BAD_REQUEST).send({
                status: HttpStatus.BAD_REQUEST,
                errMsg: "assign module_id and scene_id at the same time",
                data: null,
                isSuccess: false
            })
            return
        }
        
        if (taskRelation.moduleIdList && taskRelation.moduleIdList.length === 0 && !taskRelation.sceneIdList) {
            _res.status(HttpStatus.OK).send({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                errMsg: "module id list no data",
                isSuccess: false,
                taskType: taskRelation.taskType
            })
            return
        }

        if (taskRelation.sceneIdList && !taskRelation.moduleIdList && taskRelation.sceneIdList.length === 0) {
            _res.status(HttpStatus.OK).send({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                errMsg: "scene id list no data",
                isSuccess: false,
                taskType: taskRelation.taskType
            })
            return
        }

        // 设置遍历的数组
        if (taskRelation.taskType === "1" ) {
            dataList = taskRelation.moduleIdList
        } else {
            dataList = taskRelation.sceneIdList
        }

        for (let Id of dataList) {
            try {
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
                await this.taskService.createTaskRelation(taskRelationCreateInput)
            } catch(err) {
                this.taskLogger.error(`create task relation failed for error ${err.message}\n, start delete task relation with taskId: ${taskRelation.taskId}`,"")
                try {
                    // 创建relation失败，删除taskId关联的所有relation
                    await this.taskService.removeTaskRelation(taskRelation.taskId)
                    this.taskLogger.log(`remove task relation with taskId: ${taskRelation.taskId} successfully`)
                    _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                        status: HttpStatus.INTERNAL_SERVER_ERROR,
                        errMsg: err.message,
                        isSuccess: false,
                        taskType: taskRelation.taskType,
                        data: null
                    })
                    return
                } catch(removeErr) {
                    // 删除relation失败
                   this.taskLogger.error(`remove task relation with taskId: ${taskRelation.taskId} failed for ${removeErr.message}`)
                   _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                        status: HttpStatus.INTERNAL_SERVER_ERROR,
                        errMsg: removeErr.message,
                        isSuccess: false,
                        taskType: taskRelation.taskType,
                        data: null
                    })
                   return 
                }
            }
        }
        // 创建relation成功
        _res.status(HttpStatus.OK).send({
            status: HttpStatus.OK,
            message: "create task relation successfully",
            isSuccess: true,
            taskType: taskRelation.taskType
        })
        return 
    }


    // todo: 考虑后面把for循环调用service移到service内部处理
    @Post("updateRelation")
    async updateTaskRelation(@Body() updateRelationDto:TaskRelationUpdataDto, @Res() _res) {
        switch(updateRelationDto.taskType) {
            case "1": {
                if ((!updateRelationDto.moduleIdList || updateRelationDto.moduleIdList.length === 0)){
                    const updateVO:UpdateTaskRelationVO = {
                        status: HttpStatus.BAD_REQUEST,
                        isSuccess: false,
                        errMsg: "taskType=1 and moduleIdList invalid"
                    }
                    _res.status(HttpStatus.BAD_REQUEST).send(updateVO)
                    return
                }
                break
            }
            case "2": {
                if (!updateRelationDto.sceneIdList || updateRelationDto.sceneIdList.length === 0) {
                    const updateVO:UpdateTaskRelationVO = {
                        status: HttpStatus.BAD_REQUEST,
                        isSuccess: false,
                        errMsg: "taskType=2 and sceneIdList invalid"
                    }
                    _res.status(HttpStatus.BAD_REQUEST).send(updateVO)
                    return 
                }
                break
            }
            default: {
                const updateVO = {
                    status: HttpStatus.BAD_REQUEST,
                    isSuccess: false,
                    errMsg: "unsupported taskType"
                }
                _res.status(HttpStatus.BAD_REQUEST).send(updateVO)
                return
            }
        }


        let idList = updateRelationDto.taskType === "1"?updateRelationDto.moduleIdList:updateRelationDto.sceneIdList

        try {
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
                await this.taskService.updateTaskRelation(conditon, data)    
            }
            const updateRelationSuccessVO:UpdateTaskRelationVO = {
                status: 0,
                isSuccess: true,
                message: `update relation successfully`
            }
            _res.status(HttpStatus.OK).send(updateRelationSuccessVO)
            return
            
        } catch(err) {
            this.taskLogger.error(`update relation failed with [taskId=${updateRelationDto.taskId},relationId=${updateRelationDto.relationId}]`,"")
            const updateFailedVO:UpdateTaskRelationVO = {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                isSuccess: false,
                errMsg: `update relation failed with [taskId=${updateRelationDto.taskId},relationId=${updateRelationDto.relationId}]`
            }
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(updateFailedVO)
            return
        }
    }

    @Delete("deleteRelation")
    async deleteTaskRelation(@Query() query, @Res() _res) {
        const taskId = query.taskId
        if (!taskId) {
            _res.status(HttpStatus.BAD_REQUEST).send({
                status: HttpStatus.BAD_REQUEST,
                errMsg: "taskId is invalid",
                isSuccess: false
            })
            return
        }
        try {
            await this.taskService.removeTaskRelation(taskId)
            _res.status(HttpStatus.OK).send({
                status: HttpStatus.OK,
                message: "delete relation successfully",
                isSuccess: true
            })
            return
        } catch(err) {
            this.taskLogger.error(`remove task relation with taskId: ${taskId} failed for ${err.message}`)
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                errMsg: `delete relation failed for ${err.message}`,
                isSuccess: true
            })
            return
        }
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
            let records = []
            for (let d of res) {
                let record:TaskRelationRecord = {
                    taskId: d.task_id,
                    taskType: d.task_type,
                }
                const moduleInfo = await this.mkService.findById(d.module_id)
                const sceneInfo = await this.sceneService.findById(d.scene_id)
                d.task_type === "1"?record['moduleId'] = d.module_id:record['sceneId'] = d.scene_id
                d.task_type === "1"?record['moduleName'] = moduleInfo.module_name:record['sceneName'] = sceneInfo.scene_name
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