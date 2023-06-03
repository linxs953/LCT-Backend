import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "src/feature/common/prisma/prisma.service";
import { CollectionRunDto } from "../executor/executor.dto";
import { ExecutorService } from "../executor/executor.service";
import { FeatMKService } from "../featMK/featMK.service";
import { SceneService } from "../scene/scene.service";
import { TaskRunResultService } from "./task.report.service";
import { sceneInfo2Dto } from "./utils/parse";
import { getErrorNum } from "./utils/case_statics";
import { Prisma } from "@prisma/client";

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

    async findTask(taskId:String) {
        return this.pgService.at_task_model_relation.findFirst({
            where: {
                task_id: taskId.toString()
            }
        })
    }

    async findTaskName(taskId:String) {
        return this.pgService.at_task_info.findFirst({
            where: {
                task_id: taskId.toString()
            }
        })
    }

    async findTaskRelationByTaskId(taskId:string) {
        let err:Error
        const res = await this.findTask(taskId)
        if (!res) {
            err =  new Error(`find taskRelation null with [taskId=${taskId}]`)
            throw err
        }
        return res
    }

    async findTaskInfoByTaskId(taskId:string) {
        let err:Error
        const res = await this.findTaskName(taskId)
        if (!res) {
            err =  new Error(`find taskInfo null with [taskId=${taskId}]`)
            throw err
        }
        return res

        // return new Promise((resolve,reject) => {
        //     let err:Error
        //     this.findTaskName(taskId).then(res => {
        //         if (!res) {
        //             err =  new Error(`find taskRelation null with [taskId=${taskId}]`)
        //             reject(res)
        //         }
        //         resolve(res)
        //     }).catch(err => {
        //         reject(err)
        //     })
        // })
    }

    async runTask (taskId:String, logId:String, taskRelation:Prisma.at_task_model_relationCreateInput, taskInfo:Prisma.at_task_infoCreateInput) {
        
        return new Promise(async (resolve,reject) => {
            let caseCount:number = 0
            this.findMany(taskId).then(async taskMeta => {
                for (let module of Object.keys(taskMeta)) {
                    if(taskMeta[module] && taskMeta[module].length == 0) {
                        this.taskServiceLogger.error(`module [${module}] not config scene`,"")
                        continue
                    }
                    for (let scene of Object.keys(taskMeta[module])) {
                        caseCount += Object.keys(taskMeta[module][scene]).length
                    }
                }
                this.taskServiceLogger.error(`all scene count ${caseCount}`,"")
                const detailInfo = await this.runResultService.createTaskRunRecord(taskRelation,taskInfo.task_name,logId,caseCount)
                
                for (let module of Object.keys(taskMeta)) {
                    if(taskMeta[module] && taskMeta[module].length == 0) {
                        this.taskServiceLogger.error(`module [${module}] not config scene`,"")
                        continue
                    }
                    for (let scene of Object.keys(taskMeta[module])) {
                        const dispatchDto:CollectionRunDto = {
                            name: scene,
                            data: sceneInfo2Dto(taskMeta[module][scene])
                        }
                        var extendData = []
                        const dataInfoList = await this.sceneService.findSceneDataByName(scene)
                        if (dataInfoList) {
                            for (let dataInfo of dataInfoList) {
                                extendData.push(JSON.parse(dataInfo.content))
                            }
                        }
                        this.taskServiceLogger.error(JSON.stringify(dispatchDto))
                        const allCaseCount = Object.keys(taskMeta[module][scene]).length
                        this.runService.taskRun(dispatchDto,extendData).then(taskRunRes => {
                            this.taskServiceLogger.log(`task run result: \n${JSON.stringify(taskRunRes)}`)
                            // 统计执行成功和执行失败数量
                            // this.taskServiceLogger.error(JSON.stringify(taskRunRes.error))
                            const caseExecFailedCount = getErrorNum(taskRunRes.error)
                            const caseExecSuccessCount = allCaseCount - caseExecFailedCount
                            this.runResultService.updateTaskRunRecord(detailInfo.log_id,taskRunRes,scene, allCaseCount ,caseExecSuccessCount,caseExecFailedCount).then(rr => {
                                // resolve(res)
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
                            this.runResultService.updateTaskRunRecord(detailInfo.log_id, err,scene).then(rr => {
                                reject(err)
                            }).catch(updateErr => {
                                reject(updateErr)
                            })
                        })
                    }
                }
            })
        })
    }

    async findMany(taskId:String) {
        return new Promise(async (resolve,reject) => {
             const  taskData = await this.pgService.at_task_model_relation.findMany({
                where: {
                    task_id: taskId.toString()
                },
             })
             if (!taskData || taskData.length == 0) {
                reject(new Error("not found scene data with provided taskId"))
             }
            //  this.taskServiceLogger.error(taskData,"")
             var moduleIdList = []
             for (let record of taskData) {
                moduleIdList.push(record.module_id)
             }
             this.mkService.findMany(moduleIdList).then(res => {
                resolve(res)
             }).catch(err => {
                reject(err)
             })
        })
    }

    // 根据detailId获取任务运行记录
    async getStatus(runId:String) {
        return new Promise((resolve,reject) => {
            this.runResultService.getTaskRunRecord(runId).then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        })
    }

}