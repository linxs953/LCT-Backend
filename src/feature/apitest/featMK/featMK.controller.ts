import { Body, Controller,Delete,Get,HttpStatus,Logger, Post, Query, Res } from "@nestjs/common";
import {FeatMKService } from "./featMK.service";
import { APITEST_CONFIG } from "../apitest.config";
import { SceneService } from "../scene/scene.service";
import { UpdateModuleDto, CreateModuleDto, DeleteModuleParamDto, FindModuleParamDto } from "./featMK.dto";
import { CreateModudleVO, DeleteModuleVO, FindModuleInfoVO, FindModuleListVO, UpdateModuleVO } from "./featMK.vo";
import { Prisma } from "@prisma/client";
const random = require("string-random")
var sd = require('silly-datetime');


@Controller(`${APITEST_CONFIG.routePrefix}/mkService`)
export class FeatMKController {
    private readonly mkLogger:Logger
    constructor (
        private readonly mkService:FeatMKService,
        private readonly sceneService:SceneService
    ) {
        this.mkLogger = new Logger(FeatMKController.name)
    }    

    @Post("create")
    async createModule(@Body() newModuleDto:CreateModuleDto, @Res() _res) {
        let createVO:CreateModudleVO = {
            data: {
                moduleId: "",
                moduleName: "",
                createTime: undefined,
                createUser: ""
            },
            status: 0,
            message: "",
            isSuccess: true
        }
        const moduleInfo = await this.mkService.createModule({
            module_id: random(20),
            module_name: newModuleDto.moduleName,
            business_name: newModuleDto.businessBelong,
            module_owner: newModuleDto.ownerName,
            create_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm'),
            modify_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm'),
            create_person: "admin",
            modify_person: "admin"
        })
        const moduleInfoData = (<Prisma.at_module_infoCreateInput>moduleInfo.data)

        if (moduleInfo.error) {
            createVO['isSuccess'] = false
            createVO['message'] = moduleInfo.error.message
            createVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            createVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(createVO)
            return
        }
        createVO['isSuccess'] = true
        createVO['message'] = "create module successfully"
        createVO['data'] = {
            moduleId: moduleInfoData.module_id,
            moduleName: moduleInfoData.module_name,
            createTime: moduleInfoData.create_time,
            createUser: moduleInfoData.create_person
        }
        _res.status(HttpStatus.OK).send(createVO)
        return
        
    }

    @Post("update")
    async updateModule(@Body() updateModuleDto:UpdateModuleDto, @Res() _res) {
        const res = await this.mkService.findById(updateModuleDto.moduleId)
        let updateVO:UpdateModuleVO = {
            data: {
                moduleId: "",
                moduleName: "",
                createTime: "",
                createUser: ""
            },
            status: 0,
            message: "",
            isSuccess: false
        }
        try {
            if (res.data) {
                const data = (<Prisma.at_module_infoCreateInput>res.data)
                updateModuleDto.moduleName?updateModuleDto:updateModuleDto.moduleName=data.module_name
                updateModuleDto.businessBelong?updateModuleDto:updateModuleDto.businessBelong=data.business_name
                updateModuleDto.ownerName?updateModuleDto:updateModuleDto.ownerName=data.module_owner
            }
    
            const updateMkInfo = await this.mkService.updateModule(
                {
                    module_id: updateModuleDto.moduleId
                },
                {
                    module_name: updateModuleDto.moduleName,
                    module_id: updateModuleDto.moduleId,
                    business_name: updateModuleDto.businessBelong,
                    module_owner: updateModuleDto.ownerName,
                    create_time: res.data['create_time'],
                    modify_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm'),
                    create_person: "admin",
                    modify_person: "admin"
                }
            )
            if (updateMkInfo.error) {
                updateVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
                updateVO['isSuccess'] = false
                updateVO['message'] = updateMkInfo.error.message
                updateVO['data'] = null
                _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(updateVO)
                return
            }
            _res.status(HttpStatus.OK).send(updateVO)
            return

        } catch(err) {
            this.mkLogger.error(`update module with [condition=${JSON.stringify(updateModuleDto.moduleId)}] failed`,err)
            updateVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            updateVO['isSuccess'] = false
            updateVO['message'] = err.message
            updateVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(updateVO)
            return
        }

    }

    @Delete("delete")
    async deleteModule(@Query() query:DeleteModuleParamDto, @Res() _res) {
        let deleteVO:DeleteModuleVO = {
            status: 0,
            message: "",
            isSuccess: false
        }
        const deletModuleInfo = await this.mkService.deleteModule(query.moduleId)
        if (deletModuleInfo.error) {
            deleteVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            deleteVO['isSuccess'] = false
            deleteVO['message'] = deletModuleInfo.error.message
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(deleteVO)
            return
        }
        deleteVO['status'] = HttpStatus.OK
        deleteVO['isSuccess'] = true
        deleteVO['message'] = "delete module successfully"
        _res.status(HttpStatus.OK).send(deleteVO)
        return  
    }

    @Get("getInfo")
    async findModule(@Query() query: FindModuleParamDto, @Res() _res) {
        let findVO:FindModuleInfoVO = {
            data: null,
            status: 0,
            message: "",
            isSuccess: false
        }

        const findModuleInfo = await this.mkService.findById(query.moduleId)
        if (findModuleInfo.error) {
            findVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            findVO['isSuccess'] = false
            findVO['message'] = findModuleInfo.error.message
            findVO['message'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(findVO)
            return
        }
        findVO['status'] = HttpStatus.OK
        findVO['isSuccess'] = true
        findVO['message'] = "fetch module info successfully"
        findVO['data'] = {
            moduleId: (<Prisma.at_module_infoCreateInput>findModuleInfo.data).module_id,
            moduleName: (<Prisma.at_module_infoCreateInput>findModuleInfo.data).module_name,
            createTime: (<Prisma.at_module_infoCreateInput>findModuleInfo.data).create_time,
            createUser: (<Prisma.at_module_infoCreateInput>findModuleInfo.data).create_person
        }
        _res.status(HttpStatus.OK).send(findVO)
    }


    @Get("getAllModules")
    async findAllModule(@Res() _res) {
        const dataList = await this.mkService.findModuleList()
        let findListVO:FindModuleListVO = {
            status: 0,
            message: "",
            isSuccess: false,
            data: [],

        }
        if (dataList.error) {
            findListVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            findListVO['isSuccess'] = false
            findListVO['message'] = dataList.error.message
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(findListVO)
            return
        }
        findListVO['data'] = dataList.data
        findListVO['status'] = HttpStatus.OK
        findListVO['isSuccess'] = true
        findListVO['message'] = "fetch module info list successfully"
        _res.status(HttpStatus.OK).send(findListVO)
        return
    }
}