import { Body, Injectable, Logger, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PostgresService } from "src/common/prisma/prisma.service";
import {CaseVO, StepServiceVO} from "./step.vo"
import { CreateStepDto, DeleteCaseInfoDto, updateCaseInfoDto } from "./step.dto";
const random = require('string-random')

@Injectable()
export class StepService {
    private stepServiceLogger:Logger
    constructor(
        private pgService:PostgresService
        
    ) {
        this.stepServiceLogger = new Logger(StepService.name)
    }

    async findByCaseId(caseId:String) {
        let result:StepServiceVO = {
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

    async createCase(createCaseDto:CreateStepDto) {
        let result:StepServiceVO = {
            data: null,
            error: null
        }
        try {
            let data:Prisma.at_case_infoCreateInput = {
                case_id: `CASE${random(10)}`,
                case_name: createCaseDto.caseName,
                is_skip: createCaseDto.isSkip,
                module_id: createCaseDto.moduleId,
                pre_fn: createCaseDto.preFn,
                after_fn: createCaseDto.afterFn,
                api_method: createCaseDto.apiMethod,
                api_param: createCaseDto.apiParam,
                api_url: createCaseDto.apiUrl,
                api_data: createCaseDto.apiData,
                api_headers: createCaseDto.apiHeaders,
                extract_spec: createCaseDto.extractSpec,
                expect: createCaseDto.expect,
                api_config: createCaseDto.apiConfig,
                create_person: createCaseDto.createPerson,
                modify_person: createCaseDto.modifyPerson,
                create_time: createCaseDto.createTime,
                modify_time: createCaseDto.modifyTime
            }
            result.data = await this.pgService.at_case_info.create({
                data: data
            })
        } catch(err) {
            this.stepServiceLogger.error(`create case failed`, err)
            result.error = err
        }
        return result
    }


    async updateCase(updateCasePayload:updateCaseInfoDto) {
        let result = {
            data: null,
            error: null
        }
        let updateCaseInfo:Prisma.at_case_infoCreateInput = {
            case_id: updateCasePayload.condition.case_id,
            case_name: updateCasePayload.data.caseName,
            is_skip: updateCasePayload.data.isSkip,
            module_id: updateCasePayload.data.moduleId,
            pre_fn: updateCasePayload.data.preFn,
            after_fn: updateCasePayload.data.afterFn,
            api_method: updateCasePayload.data.apiMethod,
            api_param: updateCasePayload.data.apiParam,
            api_url: updateCasePayload.data.apiUrl,
            api_data: updateCasePayload.data.apiData,
            api_headers: updateCasePayload.data.apiHeaders,
            extract_spec: updateCasePayload.data.extractSpec,
            expect: updateCasePayload.data.expect,
            api_config: updateCasePayload.data.apiConfig,
            create_person: updateCasePayload.data.createPerson,
            modify_person: updateCasePayload.data.modifyPerson,
            create_time: updateCasePayload.data.createTime,
            modify_time: updateCasePayload.data.modifyTime
        }
        try {
            result.data = await this.pgService.at_case_info.update({
                data: updateCaseInfo,
                where: updateCasePayload.condition
            })
        } catch(err) {
            this.stepServiceLogger.error(`update case info failed with [${JSON.stringify(updateCasePayload.condition)}]`,err)
            result.error = err
        }
        return result
    }

    async deleteCaseInfo(deleteDto:DeleteCaseInfoDto) {
        let result = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_case_info.delete({
                where: deleteDto.condition
            })
        } catch(err) {
            this.stepServiceLogger.error(`delete case failed with condition [${JSON.stringify(deleteDto.condition)}]`,err)
            result.error = err
        }
        return result
    }
}