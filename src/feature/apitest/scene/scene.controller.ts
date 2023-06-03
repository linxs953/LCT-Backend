import { Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query, Res } from "@nestjs/common";
import { Body, HostParam, Param } from "@nestjs/common/decorators/http/route-params.decorator";
import { Prisma } from "@prisma/client";
import { APITEST_CONFIG } from "../apitest.config";
import { SceneService} from "./scene.service";
import {Logger} from "@nestjs/common"

// @Controller(`${APITEST_CONFIG.routePrefix}/sceneService`)
@Controller({host: ":localhost"})
export class SceneController {
    private sceneLogger:Logger
    constructor (private readonly sceneService:SceneService,) {
            this.sceneLogger = new Logger(SceneController.name)
    }
    
    @Get("/getInfo")
    getInfo(@HostParam() account:string[]) {
        this.sceneLogger.debug(`localhost: ${JSON.stringify(account)}`)
        return account
    }

    
    // @HttpCode(200)
    // @Post("add")
    // async createScene(@Body() sceneDto:SceneDto, @Res() _response) {
    //    this.sceneLogger.debug("create new scene for testcase")
    //    const verifyRs = check(sceneDto)
    //    if (verifyRs) {
    //         this.sceneLogger.error(`sceneDto verify error for ${verifyRs}`)
    //         _response.status(HttpStatus.BAD_REQUEST).send({
    //             "status": HttpStatus.BAD_REQUEST,
    //             "isSuccess": false,
    //             "err": "parse scene post data failed",
    //             "data": null
    //         })
    //         return
    //     }
    //     this.sceneLogger.debug("sceneDto verify successfully")
    //     try {
    //         const rs = await this.sceneService.insertOneScene(sceneDto)
    //         this.sceneLogger.debug(`call sceneService Successfully. db record:\n${JSON.stringify(rs)}`)
    //         this.sceneLogger.debug("scene create complete")
    //         _response.status(HttpStatus.OK).send({
    //             "status": HttpStatus.OK,
    //             "isSuccess": true,
    //             "data": rs
    //        })
    //        return
    //     } catch(err) {
    //         this.sceneLogger.error("create new scene failed")
    //         // this.sceneLogger.error(err)
    //         throw err

    //         _response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
    //             "status": HttpStatus.INTERNAL_SERVER_ERROR,
    //             "isSuccess": false,
    //             "error": err.message,
    //             "data": null
    //        })
    //        return
    //     }
    // }
}