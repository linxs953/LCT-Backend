import { Body, Injectable, Logger, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PostgresService } from "src/feature/common/prisma/prisma.service";
import {CaseVO, FindCaseRecordVO} from "./step.vo"

@Injectable()
export class StepService {
    private stepServiceLogger:Logger
    constructor(
        private pgService:PostgresService
        
    ) {
        this.stepServiceLogger = new Logger(StepService.name)
    }


    // async findMany(caseIdList:Array<String>) {
    //     return new Promise((resolve,reject) => {
    //         var result = {}
    //         var cache = []
    //         for (let caseId of caseIdList) {
    //             this.pgService.at_case_info.findFirst({
    //                 where: {
    //                     case_id: caseId.toString()
    //                 }
    //             }).then(res => {
    //                 if (!res){
    //                     reject(new Error(`get case data by id error. got ${res}`))
    //                 }
    //                 result[res['case_name']] = res
    //                 cache.push(res['case_name'])
    //                 if (cache.length == caseIdList.length) {
    //                     resolve(result)
    //                 }
    //             }).catch(err => {
    //                 reject(err)
    //             })
    //         }
            
    //     })
    // }

    async findByCaseId(caseId:String) {
        let result:FindCaseRecordVO = {
            data: null,
            error: null
        }
        try{
            const data = await this.pgService.at_case_info.findFirst({
                where: {
                    case_id: caseId.toString(),
                    is_skip: 0
                }
            })
            const caseInfo:CaseVO = {
                case_no: data.case_no,
                case_id: data.case_id,
                case_name: data.case_name,
                is_skip: data.is_skip,
                module_id: data.module_id,
                pre_fn: data.pre_fn,
                after_fn: data.after_fn,
                api_method: data.api_method,
                api_param: data.api_param,
                api_url: data.api_url,
                api_data: data.api_data,
                api_headers: data.api_headers,
                extract_spec: data.extract_spec,
                expect: data.expect,
                api_config: data.api_config
            }
            result.data = caseInfo
        } catch(err) {
            this.stepServiceLogger.error(`find case with [caseId=${caseId}] failed`,err.message)
            result.error = err
        }
       return result
    }
}