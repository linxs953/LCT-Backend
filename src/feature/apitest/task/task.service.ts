import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "src/feature/common/prisma/prisma.service";
import { CollectionRunDto } from "../executor/executor.dto";
import { ExecutorService } from "../executor/executor.service";
import { FeatMKService } from "../featMK/featMK.service";
import { SceneService } from "../scene/scene.service";
import { TaskRunResultService } from "./task.report.service";
import { Prisma } from "@prisma/client";
import { CaseStatics, SceneDataTrans } from "./task.utils";
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
        let err:Error
        const res = await this.pgService.at_task_model_relation.findFirst({
            where: {
                task_id: taskId.toString()
            }
        })
        if (!res) {
            err =  new Error(`find taskRelation null with [taskId=${taskId}]`)
            throw err
        }
        return res
    }


    /*
        获取任务信息，对findTaskInfo的封装
    */
    async findTaskInfoByTaskId(taskId:string) {
        let err:Error
        const res = await this.pgService.at_task_info.findFirst({
            where: {
                task_id: taskId.toString()
            }
        })
        if (!res) {
            err =  new Error(`find taskInfo null with [taskId=${taskId}]`)
            throw err
        }
        return res
    }

    /*
        运行任务，返回一组promise任务
    */
    async runTask (taskId:String, logId:String, taskRelation:Prisma.at_task_model_relationCreateInput, taskInfo:Prisma.at_task_infoCreateInput) {
        let caseCount:number = 0
        const taskMeta = await this.findMany(taskId)
        let promises = []

        // 遍历任务的所有模块
        for (let module of Object.keys(taskMeta)) {
            if(taskMeta[module] && taskMeta[module].length == 0) {
                this.taskServiceLogger.error(`module [${module}] not config scene`,"")
                continue
            }

            // 遍历模块关联的场景，并统计用例数量
            for (let scene of Object.keys(taskMeta[module])) {
                caseCount += Object.keys(taskMeta[module][scene]).length
            }
        }


        this.taskServiceLogger.error(`all scene count ${caseCount}`,"")

        // 创建任务运行记录
        const detailInfo = await this.runResultService.createTaskRunRecord(taskRelation,taskInfo.task_name,logId,caseCount)
        
        // 遍历任务下面的所有场景，封装成promise执行
        for (let module of Object.keys(taskMeta)) {
            if(taskMeta[module] && taskMeta[module].length == 0) {
                this.taskServiceLogger.error(`module [${module}] not config scene`,"")
                continue
            }

            // 遍历模块下的所有场景
            for (let scene of Object.keys(taskMeta[module])) {
                const dispatchDto:CollectionRunDto = {
                    name: scene,
                    data: SceneDataTrans.sceneInfo2Dto(taskMeta[module][scene])
                }

                // 封装成promise
                var extendData = []
                const dataInfoList = await this.sceneService.findSceneDataByName(scene)
                promises.push(new Promise((resolve,reject) => {
                    if (dataInfoList) {
                        for (let dataInfo of dataInfoList) {
                            extendData.push(JSON.parse(dataInfo.content))
                        }
                    }
                    this.taskServiceLogger.error(JSON.stringify(dispatchDto))

                    // 获取场景的用例数量
                    const allCaseCount = Object.keys(taskMeta[module][scene]).length
                    this.runService.taskRun(dispatchDto,extendData).then(taskRunRes => {
                        this.taskServiceLogger.log(`task run result: \n${JSON.stringify(taskRunRes)}`)
    
                        // 统计执行成功和执行失败数量
                        const caseExecFailedCount = CaseStatics.getErrorNum(taskRunRes.error)
                        const caseExecSuccessCount = allCaseCount - caseExecFailedCount

                        // 拿执行结果更新record
                        this.runResultService.updateTaskRunRecord(detailInfo.log_id,taskRunRes,scene, allCaseCount ,caseExecSuccessCount,caseExecFailedCount).then(rr => {
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
                        this.runResultService.updateTaskRunRecord(detailInfo.log_id, err,scene).then(rr => {
                            reject(err)
                        }).catch(updateErr => {
                            reject(updateErr)
                        })
                    })
                }))
            }
        }
        return promises

        // return new Promise(async (resolve,reject) => {
        //     let caseCount:number = 0
        //     this.findMany(taskId).then(async taskMeta => {
        //         for (let module of Object.keys(taskMeta)) {
        //             if(taskMeta[module] && taskMeta[module].length == 0) {
        //                 this.taskServiceLogger.error(`module [${module}] not config scene`,"")
        //                 continue
        //             }
        //             for (let scene of Object.keys(taskMeta[module])) {
        //                 caseCount += Object.keys(taskMeta[module][scene]).length
        //             }
        //         }
        //         this.taskServiceLogger.error(`all scene count ${caseCount}`,"")
        //         const detailInfo = await this.runResultService.createTaskRunRecord(taskRelation,taskInfo.task_name,logId,caseCount)
                
        //         for (let module of Object.keys(taskMeta)) {
        //             if(taskMeta[module] && taskMeta[module].length == 0) {
        //                 this.taskServiceLogger.error(`module [${module}] not config scene`,"")
        //                 continue
        //             }
        //             for (let scene of Object.keys(taskMeta[module])) {
        //                 const dispatchDto:CollectionRunDto = {
        //                     name: scene,
        //                     data: sceneInfo2Dto(taskMeta[module][scene])
        //                 }
        //                 var extendData = []
        //                 const dataInfoList = await this.sceneService.findSceneDataByName(scene)
        //                 if (dataInfoList) {
        //                     for (let dataInfo of dataInfoList) {
        //                         extendData.push(JSON.parse(dataInfo.content))
        //                     }
        //                 }
        //                 this.taskServiceLogger.error(JSON.stringify(dispatchDto))
        //                 const allCaseCount = Object.keys(taskMeta[module][scene]).length
        //                 this.runService.taskRun(dispatchDto,extendData).then(taskRunRes => {
        //                     this.taskServiceLogger.log(`task run result: \n${JSON.stringify(taskRunRes)}`)
        //                     // 统计执行成功和执行失败数量
        //                     // this.taskServiceLogger.error(JSON.stringify(taskRunRes.error))
        //                     const caseExecFailedCount = getErrorNum(taskRunRes.error)
        //                     const caseExecSuccessCount = allCaseCount - caseExecFailedCount
        //                     this.runResultService.updateTaskRunRecord(detailInfo.log_id,taskRunRes,scene, allCaseCount ,caseExecSuccessCount,caseExecFailedCount).then(rr => {
        //                         // resolve(res)
        //                         if (taskRunRes.status == 0){
        //                             this.taskServiceLogger.log(`run scene [${scene}] successfully`)
        //                         } else {
        //                             this.taskServiceLogger.error(`run scene [${scene}] failed`,"")
        //                         }
        //                     }).catch(updateErr => {
        //                         reject(updateErr)
        //                     })  
        //                 }).catch(err => {
        //                     this.taskServiceLogger.error(JSON.stringify(err),"")
        //                     // 运行collection抛了异常，不更新数量，这段大概率不会执行到
        //                     // 直接调用的collectionRun方法，方法并没有抛出异常，promise.catch不会执行
        //                     this.runResultService.updateTaskRunRecord(detailInfo.log_id, err,scene).then(rr => {
        //                         reject(err)
        //                     }).catch(updateErr => {
        //                         reject(updateErr)
        //                     })
        //                 })
        //             }
        //         }
        //     })
        // })
    }


    /*
        获取多个 【任务关联模块】数据
    */
    async findMany(taskId:String) {
        try {
            const  taskData = await this.pgService.at_task_model_relation.findMany({
                where: {
                    task_id: taskId.toString()
                },
            })
            if (!taskData || taskData.length == 0) {
                return new Error("not found scene data with provided taskId")
            }
            var moduleIdList = []
            for (let record of taskData) {
                moduleIdList.push(record.module_id)
            }
            const res = await this.mkService.findMany(moduleIdList)
            return res
        } catch(err) {
            this.taskServiceLogger.error(JSON.stringify(err),"")
            return err
        }
        // return new Promise(async (resolve,reject) => {
        //      const  taskData = await this.pgService.at_task_model_relation.findMany({
        //         where: {
        //             task_id: taskId.toString()
        //         },
        //      })
        //      if (!taskData || taskData.length == 0) {
        //         reject(new Error("not found scene data with provided taskId"))
        //      }
        //      var moduleIdList = []
        //      for (let record of taskData) {
        //         moduleIdList.push(record.module_id)
        //      }
        //      this.mkService.findMany(moduleIdList).then(res => {
        //         resolve(res)
        //      }).catch(err => {
        //         reject(err)
        //      })
        // })
    }

    // 根据detailId获取任务运行记录
    async getStatus(runId:String) {
        try {
            const res = await this.runResultService.getTaskRunRecord(runId)
            return res
        } catch(err) {
            this.taskServiceLogger.error(err.message, "")
            return null
        }
    }

    async createTaskInfo(taskInfo:Prisma.at_task_infoCreateInput) {
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
        return this.pgService.at_task_info.create({
            data: taskInfo
        })
    }

    async updateTaskInfo(condition:Prisma.at_task_infoWhereUniqueInput, updatedData:Prisma.at_task_infoUpdateInput) {
        return this.pgService.at_task_info.update({
            where: condition,
            data: updatedData
        })
    }

    async deleteTaskInfo(task_id:string) {
        const taskInfo = this.findTaskInfoByTaskId(task_id)
        const taskRelation = this.findTaskRelationByTaskId(task_id)
        if (!taskInfo) {
            return
        }
        if (taskRelation) {
            await this.removeTaskRelation(task_id)
        }
        return this.pgService.at_task_info.delete({
            where: {
                task_id: task_id
            }
        })
    }


    async createTaskRelation(relation:Prisma.at_task_model_relationCreateInput) {
        const task_id = relation.task_id
        const module_id = relation.module_id
        const taskRelationInfo = await this.findTaskRelationByTaskId(task_id)

        // 如果存在任务关联记录，判断是否模块已关联
        if (taskRelationInfo && taskRelationInfo.module_id === module_id) {
            this.taskServiceLogger.error(`task id ${task_id} relation exist module_id ${module_id},create failed`,"")
            return new Error("task_id relation exist module_id")
        }

        if (!relation.scene_id && !relation.module_id) {
            return new Error("relation scene_id and module_id is null")
        }
        relation.id = random(10)
        return this.pgService.at_task_model_relation.create({
            data: relation
        })
    }

    async createTaskRelations(taskId:string, moduleList: Array<string>) {
        // todo
    }

    async updateTaskRelation(condition:Prisma.at_task_model_relationWhereUniqueInput, data:Prisma.at_task_model_relationUpdateInput) {
        return this.pgService.at_task_model_relation.update({
            where: {
                task_id: condition.task_id,
                scene_id: condition.scene_id
            },
            data: data
        })
    }

    async removeTaskRelation(task_id:string) {
        return this.pgService.at_task_model_relation.delete({
            where: {
                task_id: task_id
            }
        })
    }

    async findRelation(task_id?: string) {
        if (!task_id) {
            return this.pgService.at_task_model_relation.findMany()
        }
        return this.pgService.at_task_model_relation.findFirst({
            where: {
                task_id: task_id
            }
        })
    }
}