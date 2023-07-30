import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PostgresService } from "src/common/prisma/prisma.service";
import { TaskRunRecordCreateDto, TaskRunRecordUpdateDto } from "./task.dto";
import { TaskServiceDataListVO, TaskServiceVO } from "./task.vo";
var sd = require('silly-datetime');



@Injectable()
export class TaskRunResultService {
    private readonly resultLogger:Logger
    constructor(
        private pgService:PostgresService    
    ) {
        this.resultLogger = new Logger(TaskRunResultService.name)
    }

    // async createTaskRunRecord(taskRelation:Prisma.at_task_model_relationCreateInput, 
    //                             taskName:String,logId:String,allCaseNum:number=0,
    //                             execFinishedNum:number=0,execSuccessNum:number=0,
    //                             exec_FailedNum:number=0) {
    async createTaskRunRecord(runRecord:TaskRunRecordCreateDto) {
        let result:TaskServiceVO = {
            data: null,
            error: null
        }
        try {
            const day = sd.format(new Date(), 'YYYY-MM-DD HH:mm')
            const taskRunRecord:Prisma.at_task_run_logCreateInput = {
                log_id: runRecord.logId.toString(),
                task_id: runRecord.relation.task_id.toString(),
                task_run_name: `${runRecord.taskName}-${new Date().getTime()}`,
                status: 0,
                run_result: "{}",
                failed_result: "{}",
                all_case_num: runRecord.allCaseNum,
                exec_finished_num: runRecord.execFinishedNum, 
                exec_success_num: runRecord.execSuccessNum,
                exec_failed_num: runRecord.exec_FailedNum,
                create_time: day
            }
            result.data = await this.pgService.at_task_run_log.create({
                data: taskRunRecord
            })
            return result
            
        } catch(err) {
            result.error = err
            return result
        }
        // const day = sd.format(new Date(), 'YYYY-MM-DD HH:mm')
        // const taskRunRecord:Prisma.at_task_run_logCreateInput = {
        //     log_id: logId.toString(),
        //     task_id: taskRelation.task_id.toString(),
        //     task_run_name: `${taskName}-${new Date().getTime()}`,
        //     status: 0,
        //     run_result: "{}",
        //     failed_result: "{}",
        //     all_case_num: allCaseNum,
        //     exec_finished_num: execFinishedNum, 
        //     exec_success_num: execSuccessNum,
        //     exec_failed_num: exec_FailedNum,
        //     create_time: day
        // }
        // return this.pgService.at_task_run_log.create({
        //     data: taskRunRecord
        // })
    }

    // async updateTaskRunRecord(runId:String, runResult:{},scenName:String,
    //                             finishedCount:number=0,successCount:number=0,
    //                             failedCount:number=0) {
    async updateTaskRunRecord(updateRecord:TaskRunRecordUpdateDto){
        let result = {
            data: null,
            error: null
        }
        try {
            const detailInfo = await this.pgService.at_task_run_log.findFirst({
                where: {
                    log_id: updateRecord.runId.toString()
                }
            })
            let newResult={}
            let newFailed={}
            if (detailInfo.run_result != "{}") {
            newResult = JSON.parse(detailInfo.run_result) 
            newResult[updateRecord.scenName.toString()] = updateRecord.runResult['data']?updateRecord.runResult['data']:{}

            } else {
                newResult[updateRecord.scenName.toString()] = updateRecord.runResult['data']?updateRecord.runResult['data']:{}
            }

            if(detailInfo.failed_result != "{}") {
                newFailed = JSON.parse(detailInfo.failed_result)
                newFailed[updateRecord.scenName.toString()] = updateRecord.runResult['error']?updateRecord.runResult['error']:{}
            } else {
                newFailed[updateRecord.scenName.toString()] = updateRecord.runResult['error']?updateRecord.runResult['error']:{}
            }

            result.data = await this.pgService.at_task_run_log.update({
                where: {
                    log_id: updateRecord.runId.toString()
                },
                data: {
                    status: updateRecord.runResult['error']?2:1,
                    run_result: JSON.stringify(newResult),
                    failed_result: JSON.stringify(newFailed),
                    exec_finished_num: detailInfo.exec_finished_num + updateRecord.finishedCount,
                    exec_failed_num: detailInfo.exec_failed_num + updateRecord.failedCount,
                    exec_success_num: detailInfo.exec_success_num + updateRecord.successCount
                }
            })
            return result
        } catch(err) {
            this.resultLogger.error(`update task run record with [logId=${updateRecord.runId}] failed`,err)
            result.error = err
            return result
        }
        //  const detailInfo = await this.pgService.at_task_run_log.findFirst({
        //     where: {
        //         log_id: updateRecord.runId.toString()
        //     }
        // })
        // var newResult={}
        // var newFailed={}
        // if (detailInfo.run_result != "{}") {
        //    newResult = JSON.parse(detailInfo.run_result) 
        //    newResult[updateRecord.scenName.toString()] = updateRecord.runResult['data']?updateRecord.runResult['data']:{}

        // } else {
        //     newResult[updateRecord.scenName.toString()] = updateRecord.runResult['data']?updateRecord.runResult['data']:{}
        // }

        // if(detailInfo.failed_result != "{}") {
        //     newFailed = JSON.parse(detailInfo.failed_result)
        //     newFailed[updateRecord.scenName.toString()] = updateRecord.runResult['error']?updateRecord.runResult['error']:{}
        // } else {
        //     newFailed[updateRecord.scenName.toString()] = updateRecord.runResult['error']?updateRecord.runResult['error']:{}
        // }

        // return this.pgService.at_task_run_log.update({
        //     where: {
        //         log_id: updateRecord.runId.toString()
        //     },
        //     data: {
        //         status: updateRecord.runResult['error']?2:1,
        //         run_result: JSON.stringify(newResult),
        //         failed_result: JSON.stringify(newFailed),
        //         exec_finished_num: detailInfo.exec_finished_num + updateRecord.finishedCount,
        //         exec_failed_num: detailInfo.exec_failed_num + updateRecord.failedCount,
        //         exec_success_num: detailInfo.exec_success_num + updateRecord.successCount
        //     }
        // })
    }

    async getTaskRunRecord(runId:String) {
        let result:TaskServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_task_run_log.findFirst({
                where: {
                    log_id: runId.toString()
                }
            })
            return result
            
        } catch(err) {
            this.resultLogger.error(`find task run record with [runId=${runId}] failed`,err)
            result.error = err
            return result
        }
    }
}