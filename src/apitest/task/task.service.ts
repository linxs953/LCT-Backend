import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "common/prisma/prisma.service";
import { CollectionRunDto } from "../executor/executor.dto";
import { ExecutorService } from "../executor/executor.service";
import { FeatMKService } from "../featMK/featMK.service";
import { SceneService } from "../scene/scene.service";
import { TaskRunResultService } from "./task.report.service";
import { Prisma } from "@prisma/client";
import { CaseStatics, SceneDataTrans } from "./task.utils";
import { TaskServiceVO, TaskServiceDataListVO } from "./task.vo";
const random = require("string-random")
var sd = require('silly-datetime');

@Injectable()
export class TaskService {
    private taskServiceLogger:Logger
    constructor (
        private  pgService:PostgresService,
        private  mkService:FeatMKService,
        private  runService:ExecutorService,
        private  runResultService:TaskRunResultService,
        private  sceneService:SceneService
    ) {
        this.taskServiceLogger = new Logger(TaskService.name)
    }


    /*
        根据taskid获取任务信息，对findTask方法的封装
    */
    async findTaskRelationByTaskId(taskId:string) {
        let result:TaskServiceVO = {
            data: null,
            error: null
        }
        try {
            const res = await this.pgService.at_task_model_relation.findFirst({
                where: {
                    task_id: taskId.toString()
                }
            })
            if (!res) {
                result.error = new Error(`find taskRelation null with [taskId=${taskId}]`)
            } else {
                result.data = res
            }
        } catch(err) {
            result.error = err
        }
        return result
    }


    /*
        获取任务信息，对findTaskInfo的封装
    */
    async findTaskInfoByTaskId(taskId:string) {
        let result:TaskServiceVO = {
            data: null,
            error: null
        }
        try {
            const res = await this.pgService.at_task_info.findFirst({
                where: {
                    task_id: taskId.toString()
                }
            })
            if (!res) {
                this.taskServiceLogger.error(`find taskInfo null with [taskId=${taskId}]`,"")
                result.error =  new Error(`find taskInfo null with [taskId=${taskId}]`)
                return result
            }
            result.data = res
        } catch(err) {
            result.error = err
        }
        return result
    }

    /*
        运行任务，返回一组promise任务
    */
    // todo: 要改task report service的返回值结构
    async runTask (taskId:String, logId:String, taskRelation:Prisma.at_task_model_relationCreateInput, taskInfo:Prisma.at_task_infoCreateInput) {
        let caseCount:number = 0
        let promises = []
        let taskMeta = await this.findMany(taskId)
        if (taskMeta.error) {
            this.taskServiceLogger.error(`fetch task data failed`,taskMeta.error)
            return []
        }
        
        // 遍历任务的所有模块
        for (let module of Object.keys(taskMeta.data)) {
            if(taskMeta.data[module] && taskMeta.data[module].length == 0) {
                this.taskServiceLogger.error(`module [${module}] not config scene`,"")
                continue
            }

            // 遍历模块关联的场景，并统计用例数量
            for (let scene of Object.keys(taskMeta.data[module])) {
                caseCount += Object.keys(taskMeta.data[module][scene]).length
            }
        }

        this.taskServiceLogger.debug(`all scene count ${caseCount}`)

        // 创建任务运行记录
        let  detailInfo = await this.runResultService.createTaskRunRecord({
            relation: taskRelation,
            taskName:taskInfo.task_name,
            logId: logId.toString(),
            allCaseNum: caseCount,
            execFinishedNum: 0,
            execSuccessNum: 0,
            exec_FailedNum: 0
        })
        if (detailInfo.error) {
            this.taskServiceLogger.error(`create task run record faield`,detailInfo.error)
            throw detailInfo.error
        }
        
        // 遍历任务下面的所有场景，封装成promise执行
        for (let module of Object.keys(taskMeta)) {
            if(taskMeta.data[module] && taskMeta.data[module].length == 0) {
                this.taskServiceLogger.error(`module [${module}] not config scene, skip module [${module}]`,"")
                continue
            }

            // 遍历模块下的所有场景
            for (let scene of Object.keys(taskMeta.data[module])) {
                const dispatchDto:CollectionRunDto = {
                    name: scene,
                    data: SceneDataTrans.sceneInfo2Dto(taskMeta.data[module][scene])
                }

                // 封装成promise
                var extendData = []
                const dataInfoList = await this.sceneService.findSceneDataByName(scene)
                if (dataInfoList.error) {
                    // 场景找不到对应的数据驱动，跳过
                    this.taskServiceLogger.error(`get scene data failed with [sceneName=${scene}], so skip this scene`,"")
                    continue
                }
                promises.push(new Promise((resolve,reject) => {
                    if (dataInfoList) {
                        for (let dataInfo of dataInfoList.data) {
                            extendData.push(JSON.parse(dataInfo.content))
                        }
                    }
                    this.taskServiceLogger.error(JSON.stringify(dispatchDto),"")

                    // 获取场景的用例数量
                    const allCaseCount = Object.keys(taskMeta.data[module][scene]).length
                    this.runService.taskRun(dispatchDto,extendData).then(taskRunRes => {
                        this.taskServiceLogger.log(`task run result: \n${JSON.stringify(taskRunRes)}`)
    
                        // 统计执行成功和执行失败数量
                        const caseExecFailedCount = CaseStatics.getErrorNum(taskRunRes.error)
                        const caseExecSuccessCount = allCaseCount - caseExecFailedCount

                        // 拿执行结果更新record
                        this.runResultService.updateTaskRunRecord({
                            runId: (<Prisma.at_task_run_logCreateInput>detailInfo.data).log_id,
                            runResult: taskRunRes,
                            scenName: scene,
                            finishedCount: allCaseCount,
                            successCount: caseExecSuccessCount,
                            failedCount: caseExecFailedCount
                        }).then(rr => {
                            // 根据任务运行状态，打印不同内容
                            if (taskRunRes.status == 0){
                                this.taskServiceLogger.log(`run scene [${scene}] successfully`)
                            } else {
                                this.taskServiceLogger.error(`run scene [${scene}] failed`,"")
                            }
                        }).catch(updateErr => {
                            reject(updateErr)
                        })  
                    }).catch(err => {
                        this.taskServiceLogger.error(JSON.stringify(err),"")

                        // 运行collection抛了异常，不更新数量，这段大概率不会执行到
                        // 直接调用的collectionRun方法，方法并没有抛出异常，promise.catch不会执行
                        this.runResultService.updateTaskRunRecord({
                            runId: (<Prisma.at_task_run_logCreateInput>detailInfo.data).log_id,
                            runResult: err,
                            scenName: scene,
                            finishedCount: 0,
                            successCount: 0,
                            failedCount: 0
                        }).then(rr => {
                            reject(err)
                        }).catch(updateErr => {
                            reject(updateErr)
                        })
                    })
                }))
            }
        }
        return promises
    }


    /*
        获取多个 【任务关联模块】数据
    */
    async findMany(taskId:String) {
        let result:TaskServiceVO = {
            data: null,
            error: null
        }
        try {
            const  taskData = await this.pgService.at_task_model_relation.findMany({
                where: {
                    task_id: taskId.toString()
                },
            })
            if (!taskData || taskData.length == 0) {
                result.error = new Error("not found scene data with provided taskId")
                return result
            }
            var moduleIdList = []
            for (let record of taskData) {
                moduleIdList.push(record.module_id)
            }
            const res = await this.mkService.findMany(moduleIdList)
            if (res.error) {
                result.error = res.error
                return result
            }
            result.data = res.data
        } catch(err) {
            this.taskServiceLogger.error(JSON.stringify(err),"")
            result.error = err
            return result
        }
        return result
    }

    async getStatus(runId:String) {
        return this.runResultService.getTaskRunRecord(runId)
    }

    async createTaskInfo(taskInfo:Prisma.at_task_infoCreateInput) {
        let result:TaskServiceVO = {
            data: null,
            error: null
        }
        try {
            if(!taskInfo.task_id) {
                taskInfo.task_id = `TASK-${random(10)}`
            }
            if (!taskInfo.run_env) {
                taskInfo.run_env = "test"
            }
            taskInfo.is_enable = 1
            taskInfo.auto_run_enable = 1
            taskInfo.modify_person = "admin"
            taskInfo.create_person = "admin"
            taskInfo.create_time = sd.format(new Date(), 'YYYY-MM-DD HH:mm')
            taskInfo.modify_time = sd.format(new Date(), 'YYYY-MM-DD HH:mm')
            result.data = await this.pgService.at_task_info.create({
                data: taskInfo
            })
        } catch(err) {
            this.taskServiceLogger.error(`create task info occur error`,"")
            result.error = err
        }
        return result        
    }

    async updateTaskInfo(condition:Prisma.at_task_infoWhereUniqueInput, updatedData:Prisma.at_task_infoUpdateInput) {
        let result:TaskServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_task_info.update({
                where: condition,
                data: updatedData
            })
        } catch(err) {
            this.taskServiceLogger.error(`update task info occur error`,"")
            result.error = err
        }
        return result
    }

    async deleteTaskInfo(task_id:string) {
        let result:TaskServiceVO = {
            error: null
        }
        try {
            const taskInfo = await this.findTaskInfoByTaskId(task_id)
            const taskRelation = await this.findTaskRelationByTaskId(task_id)
            // 找不到记录
            if (taskInfo.error) {
                this.taskServiceLogger.error(`not found taskInfo with [taskId=${task_id}]`,"")
                result.error = taskInfo.error
                return result
            }
            if (taskRelation.error) {
                this.taskServiceLogger.error(`not found task relation with [taskId=${task_id}]`,"")
                result.error = taskInfo.error
                return result
            }
            const rmTaskRelationRs = await this.removeTaskRelation(task_id)
            if (rmTaskRelationRs.error) {
                result.error = rmTaskRelationRs.error
                return result
            }
            await this.pgService.at_task_info.delete({
                where: {
                    task_id: task_id
                }
            })
        } catch(err) {
            this.taskServiceLogger.error(`delete task info occur error. error message: \n${JSON.stringify(err)}`)
            result.error = err
        }
        return result
    }


    async createTaskRelation(relation:Prisma.at_task_model_relationCreateInput) {
        let result:TaskServiceVO = {
            data: null,
            error: null
        }
        try {
            const task_id = relation.task_id
            const module_id = relation.module_id
            let taskRelationInfo = await this.findTaskRelationByTaskId(task_id)
            if (taskRelationInfo.error) {
                this.taskServiceLogger.error(`not found task relation with [taskId=${task_id}]`,"")
                result.error = taskRelationInfo.error
                return result
            }
            
            // 如果存在任务关联记录，判断是否模块已关联
            if (taskRelationInfo && (<Prisma.at_task_model_relationCreateInput>taskRelationInfo.data).module_id === module_id) {
                this.taskServiceLogger.error(`task id ${task_id} relation exist module_id ${module_id},create failed`,"")
                result.error = new Error("task_id relation exist module_id")
                return result
            }

            if (!relation.scene_id && !relation.module_id) {
                result.error = new Error("relation scene_id and module_id is null")
                return result
            }

            relation.id = random(10)
            const res = await this.pgService.at_task_model_relation.create({
                data: relation
            })
            result.data = res

        } catch(err) {
            this.taskServiceLogger.error(`create task relation with [taskId=${relation.task_id}] occur error`,"")
            result.error = err
        }
        return result
    }

    async createTaskRelations(taskId:string, moduleList: Array<string>) {
        // todo
    }

    async updateTaskRelation(condition:Prisma.at_task_model_relationWhereUniqueInput, data:Prisma.at_task_model_relationUpdateInput) {
        let result:TaskServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_task_model_relation.update({
                where: {
                    task_id: condition.task_id,
                    scene_id: condition.scene_id
                },
                data: data
            })
        } catch(err) {
            result.error = err
        }
        return result
    }

    async removeTaskRelation(task_id:string) {
        let result:TaskServiceVO = {
            data: null,
            error: null
        }
        try {
            const res = await this.pgService.at_task_model_relation.delete({
                where: {
                    task_id: task_id
                }
            })
            result.data = res
            
        } catch(err) {
            this.taskServiceLogger.error(`remove task relation with [taskId=${task_id}] occur error`, "")
            result.error = err
        }
        return result
    }

    async findRelation(task_id?: string) {
        let result:TaskServiceDataListVO = {
            data: null,
            error: null
        }
        try {
            if(!task_id) {
                result.data = await this.pgService.at_task_model_relation.findMany({})
                return result
            }
            result.data = await this.pgService.at_task_model_relation.findMany({
                where: {
                    task_id: task_id
                }
            })
            return result
        } catch(err) {
            this.taskServiceLogger.error(`find task relation with [taskId=${task_id}] occur error`,"")
            result.error = err
            return result
        }
    }
}