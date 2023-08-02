import { Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Post, Query, Res } from "@nestjs/common";
import { Body, HostParam, Param } from "@nestjs/common/decorators/http/route-params.decorator";
import { Prisma } from "@prisma/client";
import { APITEST_CONFIG } from "../apitest.config";
import { SceneService} from "./scene.service";
import {Logger} from "@nestjs/common"
import { CreateSceneInfoDto, DeleteSceneInfoParamDto, FindSceneInfoParamDto, UpdateSceneDto } from "./scene.dto";
import { CreateSceneInfoVO, DeleteSceneInfoVO, FindSceneInfoListVO, FindSceneInfoVO, SceneServiceDataListVO, UpdateSceneInfoVO } from "./scene.vo";
var sd = require('silly-datetime');

// @Controller(`${APITEST_CONFIG.routePrefix}/sceneService`)
@Controller(`${APITEST_CONFIG.routePrefix}/sceneService`)
export class SceneController {
    private sceneLogger:Logger
    constructor (private readonly sceneService:SceneService,) {
            this.sceneLogger = new Logger(SceneController.name)
    }
    
    @Get("getInfo")
    async getInfo(@Query() query:FindSceneInfoParamDto, @Res() _res) {
        const sceneInfo = await this.sceneService.findById(query.sceneId)
        let findVO: FindSceneInfoVO = {
            data: null,
            status: 0,
            isSuccess: false,
            message: ""
        }
        if (sceneInfo.error) {
            findVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            findVO['message'] = sceneInfo.error.message
            findVO['isSuccess'] = false
            findVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(findVO)
        }
        findVO['status'] = HttpStatus.OK
        findVO['message'] = "fetch scene info successfully"
        findVO['isSuccess'] = true
        findVO['data'] = <Prisma.at_scene_infoCreateInput>sceneInfo.data
        _res.status(HttpStatus.OK).send(findVO)
        return 
    }

    @Get("getAllScene")
    async getAllScene(@Res() _res) {
        let findAllVO:FindSceneInfoListVO = {
            status: 0,
            isSuccess: false,
            message: "",
            data: null,
        }
        const sceneDataList = await this.sceneService.findSceneList()
        if (sceneDataList.error) {
            findAllVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            findAllVO['isSuccess'] = false
            findAllVO['message'] = sceneDataList.error.message
            findAllVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(findAllVO)
            return
        }
        findAllVO['status'] = HttpStatus.OK
        findAllVO['isSuccess'] = true
        findAllVO['message'] = "fetch scene info list successfully"
        findAllVO['data'] = <Array<Prisma.at_scene_infoCreateInput>>sceneDataList.data
        _res.status(HttpStatus.OK).send(findAllVO)
        return
    }


    @Post("create")
    async createScene(@Body() sceneData:CreateSceneInfoDto, @Res() _res) {
        const sceneInfo = await this.sceneService.createSceneInfo({
            scene_id: "",
            module_id: sceneData.moduleId,
            is_enable: 1,
            scene_name: sceneData.sceneName,
            data_id: sceneData.dataId?sceneData.dataId: null,
            create_time: "",
            modify_time: "",
            create_person: "admin",
            modify_person: "admin"
        })
        let createVO:CreateSceneInfoVO = {
            status: 0,
            isSuccess: false,
            message: "",
            data: null
        }
        if (sceneInfo.error) {
            createVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            createVO['isSuccess'] = false
            createVO['message'] = sceneInfo.error.message
            createVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(createVO)
            return
        }
        createVO['status'] = HttpStatus.OK
        createVO['isSuccess'] = true
        createVO['message'] = "create scene successfully"
        createVO['data'] = <Prisma.at_scene_infoCreateInput>sceneInfo.data
        _res.status(HttpStatus.OK).send(createVO)
        return
    }

    @Post("update")
    async updateScene(@Body() updateSceneDto:UpdateSceneDto, @Res() _res) {
        let updateVO:UpdateSceneInfoVO= {
            status: 0,
            isSuccess: false,
            message: "",
            data: null
        }
        const oldScene = await this.sceneService.findById(updateSceneDto.sceneId)
        if (oldScene.error) {
            updateVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            updateVO['isSuccess'] = false
            updateVO['message'] = oldScene.error.message
            updateVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(updateVO)
            return
        }
        const oldSceneExpect = <Prisma.at_scene_infoCreateInput>oldScene.data
        const newSceneInfo = await this.sceneService.updateSceneInfo(
            {scene_id: updateSceneDto.sceneId},
            {
                scene_name: updateSceneDto.sceneName?updateSceneDto.sceneName: oldSceneExpect.scene_name,
                is_enable: updateSceneDto.isEnable?updateSceneDto.isEnable: oldSceneExpect.is_enable,
                module_id: updateSceneDto.moduleId?updateSceneDto.moduleId: oldSceneExpect.module_id,
                data_id: updateSceneDto.dataId?updateSceneDto.dataId:oldSceneExpect.data_id,
                modify_person: "admin",
                modify_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm')
            }
        )
        if (newSceneInfo.error) {
            updateVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            updateVO['isSuccess'] = false
            updateVO['message'] = newSceneInfo.error.message
            updateVO['data'] = null
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(updateVO)
            return
        }
        updateVO['status'] = HttpStatus.OK
        updateVO['isSuccess'] = true
        updateVO['message'] = "update scene successfully"
        updateVO['data'] = <Prisma.at_scene_infoCreateInput>newSceneInfo.data
        _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(updateVO)
        return
        
    }

    @Delete("delete")
    async deleteScene(@Query() query:DeleteSceneInfoParamDto, @Res() _res) {
        const deleteScene = await this.sceneService.deleteSceneInfo({
            scene_id: query.sceneId
        })
        let deleteVO:DeleteSceneInfoVO = {
            status: 0,
            isSuccess: false,
            message: ""
        }
        if (deleteScene.error) {
            deleteVO['status'] = HttpStatus.INTERNAL_SERVER_ERROR
            deleteVO['isSuccess'] = false
            deleteVO['message'] = deleteScene.error.message
            _res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(deleteVO)
            return
        }
        deleteVO['status'] = HttpStatus.OK
        deleteVO['isSuccess'] = true
        deleteVO['message'] = "delete scene successfully"
        _res.status(HttpStatus.OK).send(deleteVO)
        return
        
    }


    @Get("getSceneRelation")
    async getSceneRelation() {}

    @Post("createRelation")
    async createRelationWithSceneId() {}

    @Post("updateRelation")
    async updateRelationWithSceneId() {}


    @Delete("removeRelation")
    async deleteRelationWithSceneId() {}
}