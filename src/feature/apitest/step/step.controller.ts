import { Body, Controller, Delete, Get, HttpStatus, Post, Query, Res  } from "@nestjs/common";
import { APITEST_CONFIG } from "../apitest.config";
import {StepService } from "./step.service";
import {Logger} from "@nestjs/common"
import { CreateCaseDto, DeleteCaseParamDto, FetchCaseParamDto, UpdateCaseDto } from "./step.dto";
import { CreateCaseVO, DeleteCaseVO, FindCaseListVO, FindCaseVO, UpdateCaseVO } from "./step.vo";
import { Prisma } from "@prisma/client";
let sd = require("silly-datetime")
let random = require("string-random")

@Controller(`${APITEST_CONFIG.routePrefix}/stepService`)
export class StepController {
    private stepLogger:Logger
    constructor (
        private readonly stepService:StepService,
    ) {
        this.stepLogger = new Logger(StepController.name)
    }


    // 给chrome插件调用，用来同步接口数据
    @Post("syncCase")
    async syncCase() {}

    @Post("add")
    async addCaseInfo(@Body() createCase:CreateCaseDto, @Res() _res) {
        let createVO:CreateCaseVO = {
            data: null,
            status: 0,
            message: "",
            isSuccess: false
        }
        const createRs = await this.stepService.createCaseV2({
            case_id: random(10),
            case_name: createCase.caseName,
            is_skip: createCase.isSkip,
            module_id: createCase.moduleId,
            pre_fn: createCase.preFn,
            after_fn: createCase.afterFn,
            api_method: createCase.apiMethod,
            api_param: createCase.apiParam,
            api_url: createCase.apiUrl,
            api_data: createCase.apiData,
            api_headers: createCase.apiHeaders,
            extract_spec: createCase.extractSpec,
            expect: createCase.expect,
            api_config: createCase.apiConfig,
            create_person: "admin",
            modify_person: "admin",
            create_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm'),
            modify_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm')
        })
        if (createRs.error) {
            createVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            createVO['isSuccess'] = false
            createVO['message'] = createRs.error.message
            createVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(createVO)
            return
        }
        createVO['status'] = HttpStatus.OK
        createVO['isSuccess'] = true
        createVO['message'] = "create case successfully"
        createVO['data'] = <Prisma.at_case_infoCreateInput>createRs.data
        _res.status(HttpStatus.OK).send(createVO)
        return
    }

    @Post("update")
    async updateCaseInfo(@Body() updateCase:UpdateCaseDto, @Res() _res) {
        let updateVO:UpdateCaseVO = {
            data: null,
            status: 0,
            message: "",
            isSuccess: false
        }
        const caseInfo = await this.stepService.findByCaseId(updateCase.caseId)
        if (caseInfo.error) {
            updateVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            updateVO['isSuccess'] = false
            updateVO['message'] = caseInfo.error.message
            updateVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(updateVO)
            return
        }
        const updateRs = await this.stepService.updateCaseV2({
            case_id: updateCase.caseId
        },{
            case_name: updateCase.caseName?updateCase.caseName:caseInfo.data['case_name'],
            is_skip: updateCase.isSkip?updateCase.isSkip:caseInfo.data['is_skip'],
            module_id: updateCase.moduleId?updateCase.moduleId:caseInfo.data['module_id'],
            pre_fn: updateCase.preFn?updateCase.preFn:caseInfo.data['pre_fn'],
            after_fn: updateCase.afterFn?updateCase.afterFn:caseInfo.data['after_fn'],
            api_method: updateCase.apiMethod?updateCase.apiMethod:caseInfo.data['api_method'],
            api_param: updateCase.apiParam?updateCase.apiParam:caseInfo.data['api_param'],
            api_url: updateCase.apiUrl?updateCase.apiUrl:caseInfo.data['api_url'],
            api_data: updateCase.apiData?updateCase.apiData:caseInfo.data['api_data'],
            api_headers: updateCase.apiHeaders?updateCase.apiHeaders:caseInfo.data['api_headers'],
            extract_spec: updateCase.extractSpec?updateCase.extractSpec:caseInfo.data['extract_spec'],
            expect: updateCase.expect?updateCase.expect:caseInfo.data['expect'],
            api_config: updateCase.apiConfig?updateCase.apiConfig:caseInfo.data['api_config'],
            create_person: "admin",
            modify_person: "admin",
            create_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm'),
            modify_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm')
        })
        if (updateRs.error) {
            updateVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            updateVO['isSuccess'] = false
            updateVO['message'] = updateRs.error.message
            updateVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(updateVO)
            return
        }
        updateVO['status'] = HttpStatus.OK
        updateVO['isSuccess'] = true
        updateVO['message'] = "update case successfully"
        updateVO['data'] = <Prisma.at_case_infoCreateInput>updateRs.data
        _res.status(HttpStatus.OK).send(updateVO)
        return
    }


    @Delete("delete")
    async removeCaseInfo(@Query() condition:DeleteCaseParamDto, @Res() _res) {
        let deleteVO: DeleteCaseVO = {
            status: 0,
            message: "",
            isSuccess: false
        }
        const deleteRs = await this.stepService.deleteCaseV2({
            case_id: condition.caseId
        })
        if (deleteRs.error) {
            deleteVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            deleteVO['isSuccess'] = false
            deleteVO['message'] = deleteRs.error.message
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(deleteVO)
            return
        }
        deleteVO['status'] = HttpStatus.OK
        deleteVO['isSuccess'] = true
        deleteVO['message'] = "delete case successfully"
        _res.status(HttpStatus.OK).send(deleteVO)
        return
    }


    @Get("getCaseInfo")
    async fetchCaseInfo(@Query() condition:FetchCaseParamDto, @Res() _res) {
        let fetchVO:FindCaseVO = {
            status: 0,
            message: "",
            isSuccess: false,
            data: null
        }
        const fetchRs = await this.stepService.findCaseById({
            case_id: condition.caseId
        })
        if (fetchRs.error) {
            fetchVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            fetchVO['isSuccess'] = false
            fetchVO['message'] = fetchRs.error.message
            fetchVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(fetchVO)
            return
        }
        fetchVO['status'] = HttpStatus.OK
        fetchVO['isSuccess'] = true
        fetchVO['message'] = "fetch case info successfully"
        fetchVO['data'] = <Prisma.at_case_infoCreateInput>fetchRs.data
        _res.status(HttpStatus.OK).send(fetchVO)
        return
    }

    @Get("getAllCase")
    async fetchCaseList(@Res() _res) {
        let fetchAllVO:FindCaseListVO = {
            status: 0,
            message: "",
            isSuccess: false,
            data: []
        }

        const fetchAllRs = await this.stepService.findCaseAll()
        if (fetchAllRs.error) {
            fetchAllVO['isSuccess'] = false
            fetchAllVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            fetchAllVO['message'] = fetchAllRs.error.message
            fetchAllVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(fetchAllVO)
            return
        }
        fetchAllVO['isSuccess'] = true
        fetchAllVO['status'] = HttpStatus.OK
        fetchAllVO['message'] = "fetch all case successfully"
        fetchAllVO['data'] = <Array<Prisma.at_case_infoCreateInput>>fetchAllRs.data
        _res.status(HttpStatus.OK).send(fetchAllVO)
        return
    }
}