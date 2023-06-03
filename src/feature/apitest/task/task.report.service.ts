import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PostgresService } from "src/feature/common/prisma/prisma.service";
var sd = require('silly-datetime');



@Injectable()
export class TaskRunResultService {
    private readonly resultLogger:Logger
    constructor(
        private pgService:PostgresService    
    ) {
        this.resultLogger = new Logger(TaskRunResultService.name)
    }

    async createTaskRunRecord(taskRelation:Prisma.at_task_model_relationCreateInput, 
                                taskName:String,logId:String,allCaseNum:number=0,
                                execFinishedNum:number=0,execSuccessNum:number=0,
                                exec_FailedNum:number=0) {
        const day = sd.format(new Date(), 'YYYY-MM-DD HH:mm')
        const taskRunRecord:Prisma.at_task_run_logCreateInput = {
            log_id: logId.toString(),
            task_id: taskRelation.task_id.toString(),
            task_run_name: `${taskName}-${new Date().getTime()}`,
            status: 0,
            run_result: "{}",
            failed_result: "{}",
            all_case_num: allCaseNum,
            exec_finished_num: execFinishedNum, 
            exec_success_num: execSuccessNum,
            exec_failed_num: exec_FailedNum,
            create_time: day
        }
        // this.resultLogger.debug(JSON.stringify(taskRunRecord))
        return this.pgService.at_task_run_log.create({
            data: taskRunRecord
        })
    }

    async updateTaskRunRecord(runId:String, runResult:{},scenName:String,
                                finishedCount:number=0,successCount:number=0,
                                failedCount:number=0) {
        const detailInfo = await this.pgService.at_task_run_log.findFirst({
            where: {
                log_id: runId.toString()
            }
        })
        var newResult={}
        var newFailed={}
        if (detailInfo.run_result != "{}") {
           newResult = JSON.parse(detailInfo.run_result) 
           newResult[scenName.toString()] = runResult['data']?runResult['data']:{}

        } else {
            newResult[scenName.toString()] = runResult['data']?runResult['data']:{}
        }

        if(detailInfo.failed_result != "{}") {
            newFailed = JSON.parse(detailInfo.failed_result)
            newFailed[scenName.toString()] = runResult['error']?runResult['error']:{}
        } else {
            newFailed[scenName.toString()] = runResult['error']?runResult['error']:{}
        }

        return this.pgService.at_task_run_log.update({
            where: {
                log_id: runId.toString()
            },
            data: {
                status: runResult['error']?2:1,
                run_result: JSON.stringify(newResult),
                failed_result: JSON.stringify(newFailed),
                exec_finished_num: detailInfo.exec_finished_num + finishedCount,
                exec_failed_num: detailInfo.exec_failed_num + failedCount,
                exec_success_num: detailInfo.exec_success_num + successCount
            }
        })
    }

    async getTaskRunRecord(runId:String) {
        return this.pgService.at_task_run_log.findFirst({
            where: {
                log_id: runId.toString()
            }
        })
    }
}