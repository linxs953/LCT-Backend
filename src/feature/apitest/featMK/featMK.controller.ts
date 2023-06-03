import { Controller,Logger } from "@nestjs/common";
import {FeatMKService } from "./featMK.service";
import { APITEST_CONFIG } from "../apitest.config";
import { SceneService } from "../scene/scene.service";

@Controller(`${APITEST_CONFIG.routePrefix}/mkService`)
export class FeatMKController {
    private readonly mkLogger:Logger
    constructor (
        private readonly mkService:FeatMKService,
        private readonly sceneService:SceneService
    ) {
        this.mkLogger = new Logger(FeatMKController.name)
    }    

    // @HttpCode(200)
    // @Post("add")
    // async createModule(@Body() moduleInfo:MKDto, @Res() _resp) {
    //     this.mkLogger.error(moduleInfo)
    //     var moduleData:Prisma.module_infoCreateInput = {
    //         module_id: "DSMODULE" + random(10),
    //         module_name: moduleInfo.moduleName.toString(),
    //         scene_list: JSON.stringify(moduleInfo.relatedScene),
    //         business_name: moduleInfo.businessName.toString(),
    //         module_owner: moduleInfo.businessOwner.toString(),
    //         create_time: new Date(),
    //         update_time: new Date(),
    //         create_person: "default-user",
    //         update_person: "default-user"
    //     }
    //     this.mkService.create(moduleData).then(res => {
    //         this.mkLogger.debug("create module successfully")
    //         this.mkLogger.debug(`module record:\n${JSON.stringify(res)}`)
    //         _resp.status(HttpStatus.OK).send({
    //             status: HttpStatus.OK,
    //             error: null,
    //             data: res
    //         })
    //     }).catch(err =>{
    //         this.mkLogger.error("create module failed")
    //         this.mkLogger.error(`error message:\n${err}`)
    //         _resp.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
    //             status: HttpStatus.INTERNAL_SERVER_ERROR,
    //             error: err.message,
    //             data: null
    //         })
    //     }) 
    // }


    // @HttpCode(200)
    // @Post("relatedScene")
    // async setScene(@Body() updateData, @Res() _resp) {
    //     try {
    //         var findRs = await this.mkService.findModuleById(updateData.moduleId)
    //         this.mkLogger.debug(`get module info by module_id ${updateData.moduleId} successfully\n${JSON.stringify(findRs)}`)
    //         findRs['scene_list'] = JSON.stringify(updateData.sceneList)
    //         findRs['update_time'] = new Date()
    //         for (let s_id of updateData.sceneList) {
    //             await this.sceneService.updateSceneBelongModule(s_id, updateData.moduleId)
    //         }
    //         this.mkService.updateModule(updateData.moduleId, findRs).then(res => {
    //             this.mkLogger.debug(`setting module scene_list  successfully\nupdatedData: ${JSON.stringify(res)}`)
    //             _resp.status(HttpStatus.OK).send({
    //                 status: HttpStatus.OK,
    //                 message: "related module successfully",
    //                 data: res
    //             })
    //         }).catch(err => {
    //             this.mkLogger.error(`update module failed. updateData: ${JSON.stringify(updateData)}\n${JSON.stringify(err)}`)
    //             _resp.status(HttpStatus.OK).send({
    //                 status: HttpStatus.OK,
    //                 message: "related module successfully",
    //                 data: null,
    //                 error: err.message
    //             })
    //         })
            
    //     } catch(err) {
    //         this.mkLogger.error(`setScene occur error. updateData: ${JSON.stringify(updateData)}\n${JSON.stringify(err)}`)
    //         _resp.status(HttpStatus.OK).send({
    //             status: HttpStatus.OK,
    //             message: "related module successfully",
    //             data: null,
    //             error: err.message
    //         })
    //     }
    //     this.mkService.findModuleById(updateData.moduleId).then(res => {
    //         res['scene_list'] = JSON.stringify(updateData.sceneList)
    //         res['update_time'] = new Date()

    //     }).catch(err => {
    //         this.mkLogger.error(err)
    //     })
    // }
}