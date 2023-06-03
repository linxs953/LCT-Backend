import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "src/feature/common/prisma/prisma.service";

@Injectable()
export class SceneDataService {
    private dataLogger:Logger
    constructor(private readonly pgService:PostgresService) {
        this.dataLogger = new Logger(SceneDataService.name)
    }
    
    findSceneDataById(dataId:String) {
        return this.pgService.at_scene_data.findMany({
            where: {
                data_id: dataId.toString(),
                is_enable: 1
            }
        })
    }
}