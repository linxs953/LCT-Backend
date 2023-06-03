import { Controller, Get, HttpStatus, Logger, Res } from "@nestjs/common";
import { UITEST_CONFIG } from "../uitest.config";
import { SceneDataService } from "./sceneData.service";

@Controller(`${UITEST_CONFIG.routePrefix}/sceneDataService`)
export class SceneDataController {
    sceneDataLogger:Logger
    constructor(private readonly sceneDataService:SceneDataService) {
        this.sceneDataLogger = new Logger(SceneDataController.name)       
    }

    @Get("getAllData")
    async getAllData(@Res() resp_) {
        try {
            const allData = await this.sceneDataService.findAllSceneData()
            resp_.status(HttpStatus.OK).send({
                status: HttpStatus.OK,
                message: "fetch ui scense data successfully",
                data: allData
            })
            
        } catch(err) {
            resp_.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: err.message,
                data: null
            })
            return
        }
    }
    
}