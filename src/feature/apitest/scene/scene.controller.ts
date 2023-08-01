import { Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Post, Query, Res } from "@nestjs/common";
import { Body, HostParam, Param } from "@nestjs/common/decorators/http/route-params.decorator";
import { Prisma } from "@prisma/client";
import { APITEST_CONFIG } from "../apitest.config";
import { SceneService} from "./scene.service";
import {Logger} from "@nestjs/common"

// @Controller(`${APITEST_CONFIG.routePrefix}/sceneService`)
@Controller(`${APITEST_CONFIG.routePrefix}/sceneService`)
export class SceneController {
    private sceneLogger:Logger
    constructor (private readonly sceneService:SceneService,) {
            this.sceneLogger = new Logger(SceneController.name)
    }
    
    @Get("getInfo")
    async getInfo(@Query() query, @Res() _res) {
        return 
    }

    @Get("getAllScene")
    async getAllScene() {

    }


    @Post("create")
    async createScene() {

    }

    @Post("update")
    async updateScene() {

    }

    @Delete("delete")
    async deleteScene() {}


    @Get("getSceneRelation")
    async getSceneRelation() {}

    @Post("createRelation")
    async createRelationWithSceneId() {}

    @Post("updateRelation")
    async updateRelationWithSceneId() {}


    @Delete("removeRelation")
    async deleteRelationWithSceneId() {}
}