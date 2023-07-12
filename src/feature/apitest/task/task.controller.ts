import { Controller, Get, HttpStatus, Logger, Post, Query } from "@nestjs/common";
import {TaskService } from "./task.service";
import { APITEST_CONFIG } from "../apitest.config";
import { Res } from "@nestjs/common/decorators";
import { FeatMKService } from "../featMK/featMK.service";
import { getErrorNum, getSceneCaseNum } from "./utils/case_statics";
import {ApiRunVO, StartTaskVO} from "./task.vo"
const random = require("string-random")

@Controller(`${APITEST_CONFIG.routePrefix}/taskService`)
export class TaskController {
    private readonly taskLogger:Logger
    constructor (
        private readonly taskService:TaskService,
        private readonly mkService:FeatMKService
    ) {
        this.taskLogger = new Logger(TaskController.name)
    }

    // @Post("add")
    // async configApiTask(@Body() body:TaskDto, @Res() _resp) {
    //     this.taskLogger.debug(`config api task , recevive param \n${JSON.stringify(body)}`)
    //     const checkRs = check(body)
    //     if (checkRs) {
    //         this.taskLogger.error(`taskDto verify failed.data:\n${JSON.stringify(body)}`)
    //         _resp.status(HttpStatus.BAD_REQUEST).send({
    //             status: HttpStatus.BAD_REQUEST,
    //             error: checkRs.message,
    //             isSuccess:false,
    //             data: null
    //         })
    //         return
    //     }
    //     var taskBody:Prisma.task_infoCreateInput = {
    //         task_id: "DSTASK" + random(10),
    //         task_name: String(body.taskName),
    //         run_env: body.environment.toString()?body.environment.toString():"test",
    //         is_enable: body.enable,
    //         auot_run_enable: body.autoRun,
    //         create_time: new Date(),
    //         modify_time: new Date(),
    //         create_person: "default",
    //         modify_person: "default"
    //     }
    //     this.taskService.createNewTask(taskBody).then(res => {
    //         this.taskLogger.debug("task create complete!")
    //         _resp.status(HttpStatus.OK).send({
    //             status: HttpStatus.OK,
    //             isSuccess: true,
    //             error: null,
    //             data: res
    //         })
    //         return
            
    //     }).catch(err => {
    //         this.taskLogger.error(`create task occur err. errMsg:\n${err.message}`)
    //         _resp.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
    //             status: HttpStatus.INTERNAL_SERVER_ERROR,
    //             error: err.message,
    //             isSuccess: false,
    //             data:null
    //         })
    //         return
    //     })
    // }

    @Get("getAllScene")
    async getAllScene(@Query() reqParam, @Res() _res) {
        const taskId = reqParam.taskId
        this.taskLogger.debug(`start get allScene with [taskId=${taskId}]`)
        try {
            this.taskService.findMany(taskId).then(res => {
                this.taskLogger.debug(`get scene data.\nsceneData: ${JSON.stringify(res)}`)
                _res.status(HttpStatus.OK).send({
                    status: HttpStatus.OK,
                    isSuccess: true,
                    data: res
                })
                return
            }).catch(err => {
                this.taskLogger.error(err.stack,"")
                _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    isSuccess: false,
                    error: err.message
                })
                return
            })
        } catch(err) {
            this.taskLogger.error(err,"")
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: "get task case error"
            })
            return
        }
    }

    @Get("getResult")
    async getApiRunResult(@Query() query) {
        const detailId = query.runId
        this.taskLogger.debug(`find API_RUN_RESULT by [runId=${detailId}]`)
        const status_ = await this.taskService.getStatus(detailId)
        // this.taskLogger.error(status_,"")
        if (!status_) {
            this.taskLogger.error(`find API_RUN_RESULT null with [runId=${detailId}]`,"")
            const _:ApiRunVO = {
                success: false,
                message: `not found API_RUN_RESULT with [runId=${detailId}]`,
                data: null
            }
            return _
        }
        const errorDetail = status_['failed_result'] == "{}" ? null:JSON.parse(status_['failed_result'])
        const runResultDetail = status_['run_result'] == "{}" ? null:JSON.parse(status_['run_result'])
        let taskRunSceneInfoList = []
        let allSceneData = []
        
        /* 
            统计有多少个场景
        */

        // 拿到场景名称列表
        let sceneNameList:any
        if (Object.keys(errorDetail).length > Object.keys(runResultDetail).length) {
            sceneNameList = Object.keys(errorDetail)
        } else {
            sceneNameList = Object.keys(runResultDetail)
        }


        for (let scene of sceneNameList) {
            let allCaseNumOfScene = getSceneCaseNum(errorDetail,scene)

            // 如果执行成功，拿runResultDetail
            allCaseNumOfScene = allCaseNumOfScene?allCaseNumOfScene:getSceneCaseNum(runResultDetail,scene)
            const sceneFailedNum = getErrorNum(errorDetail, scene)
            const sceneSuccessNum = allCaseNumOfScene - sceneFailedNum
            taskRunSceneInfoList.push({
                sceneName: scene,
                execSuccessNum: sceneSuccessNum,
                execFailNum: sceneFailedNum,
                sceneTotalNum: allCaseNumOfScene,
                runStatus: sceneFailedNum > 0?false:true
            })

            // 拿到场景的用例名称列表
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
                
                // 根据errorInfo设置执行状态
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
            success: true,
            message: "fetch task run record successfully",
            data: {
                taskRunList: allSceneData,
                taskRunSceneList: taskRunSceneInfoList,
                taskRunInfo: {
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
        }
        return res
    }

    @Post("start")
    async start(@Query() query, @Res() _res) {
        this.taskLogger.debug(`process start task with [taskId=${query.taskId}]`)
        try {
            const logId = String("DTL" + random(10)).toUpperCase()
            let taskInfo = await this.taskService.findTaskInfoByTaskId(query.taskId)
            let taskRelation = await this.taskService.findTask(query.taskId)
            this.taskService.runTask(query.taskId,logId,taskRelation,taskInfo)
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
} 