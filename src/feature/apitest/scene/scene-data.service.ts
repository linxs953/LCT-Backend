import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "src/common/prisma/prisma.service";
import { FindSceneDataRecordVO } from "./scene.vo";

@Injectable()
export class SceneDataService {
    private dataLogger:Logger
    constructor(private readonly pgService:PostgresService) {
        this.dataLogger = new Logger(SceneDataService.name)
    }
    
    async findSceneDataById(dataId:String) {
        let result:FindSceneDataRecordVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_scene_data.findMany({
                where: {
                    data_id: dataId.toString(),
                    is_enable: 1
                }
            })
        } catch(err) {
            this.dataLogger.error(`find scene data with [dataId=${dataId}] failed.\n${err.message}`)
            result.error = err
        }
        return result 
    }


    async createSceneData() {
        
    }

    async updateSceneData() {

    }

    async deleteSceneData() {

    }

    async importSceneData(fileContent:string) {
        
    }
}