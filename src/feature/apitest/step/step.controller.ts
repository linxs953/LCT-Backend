import { Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query, Res } from "@nestjs/common";
import { Body, Param } from "@nestjs/common/decorators/http/route-params.decorator";
import { Prisma } from "@prisma/client";
import { APITEST_CONFIG } from "../apitest.config";
import {StepService } from "./step.service";
import {Logger} from "@nestjs/common"
import { checkStepDto } from "./utils/step";
import { response } from "express";
const random = require("string-random")

@Controller(`${APITEST_CONFIG.routePrefix}/stepService`)
export class StepController {
    private stepLogger:Logger
    constructor (
        private readonly stepService:StepService,
        ) {
            this.stepLogger = new Logger(StepController.name)
        }
    
    // @HttpCode(200)
    // @Post("add")
    // async createStep(@Body() stepDto:Prisma.case_infoCreateInput, @Res() _response) {
    //     stepDto['case_id'] = "DS" + String(random(8,{letters: true})).toUpperCase()
    //     const checkError = checkStepDto(stepDto)
    //     if (checkError) {
    //         this.stepLogger.error(`parse stepDto failed ${checkError.message}`)
    //         this.stepLogger.error(stepDto.extract_spec)
    //         _response.status(HttpStatus.BAD_REQUEST).send({
    //                 status: HttpStatus.BAD_REQUEST,
    //                 errMsg: checkError.message,
    //                 message: "create Step bad request",
    //                 data: null
    //             })
    //         return
    //     }
    //     stepDto['extract_spec'] = JSON.stringify(stepDto['extract_spec'])
    //     stepDto['api_headers'] = JSON.stringify(stepDto['api_headers'])
    //     stepDto['api_data'] = JSON.stringify(stepDto['api_data'])
    //     stepDto['api_config'] = JSON.stringify(stepDto['api_config'])        
    //     stepDto['api_param'] = JSON.stringify(stepDto['api_param'])  
    //     stepDto['create_time'] = new Date(stepDto.create_time)   
    //     stepDto['update_time'] = new Date(stepDto.update_time)

    //     try {
    //         this.stepLogger.log(`start create step\nstepDto: ${JSON.stringify(stepDto)}`)
    //         const rs = await this.stepService.insertOneStep(stepDto)
    //         this.stepLogger.log("create step complete")
    //         _response.status(HttpStatus.OK).send({
    //             status: 0,
    //             errMsg: "",
    //             message: "create Step Successfully",
    //             data: {
    //                 step_id: rs.case_id,
    //                 step_name: rs.case_name,
    //                 case_no: rs.case_no
    //             }
    //         })
    //         return
    //     } catch(err) {
    //         this.stepLogger.error(err)
    //         _response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
    //             status: HttpStatus.INTERNAL_SERVER_ERROR,
    //             errMsg: err.message,
    //             message: "create Step occur error",
    //             data: null
    //         })
    //         return
    //     }
    // }

    // @Get("getModuleCase")
    // findStepByModuleName(@Param() moduleCaseParam) {
    //     this.stepLogger.log(`receive /StepService/getModuleCase param ${moduleCaseParam}`)
        
    // }
}