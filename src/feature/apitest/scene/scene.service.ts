import { Logger } from "@nestjs/common";
import { Injectable, Redirect } from "@nestjs/common/decorators";
import { PostgresService } from "src/feature/common/prisma/prisma.service";
import { CaseReferService } from "./scene-case-relation.service";
import { SceneDataService } from "./scene-data.service";


@Injectable()
export class SceneService {
    private sceneServiceLogger:Logger
    constructor(
        private pgService:PostgresService,
        private caseReferService:CaseReferService,
        private dataService:SceneDataService  
        ) {
            this.sceneServiceLogger = new Logger(SceneService.name)
    }

    async findById(sceneId:string) {
        return this.pgService.at_scene_info.findFirst({
            where: {
                scene_id: sceneId
            }
        })
    }

    async findSceneDataByName(sceneName:String) {
        const sceneInfo = await this.pgService.at_scene_info.findFirst({
            where: {
                scene_name: sceneName.toString()
            }
        })
        return this.dataService.findSceneDataById(sceneInfo.data_id)
    }

    async findSceneByModuleId(moduleId:String) {
        return this.pgService.at_scene_info.findMany({
            where: {
                module_id: moduleId.toString(),
                is_enable: 1
            }
        })
    }

    async findMany(moduleId:String) {
        return new Promise(async (resolve,reject) => {
            var result = {}
            var cache = []
            // 去scene_info查找同个moduleid的所有记录
            var sceneIdList = await this.findSceneByModuleId(moduleId)
            if (sceneIdList.length == 0) {
                resolve(sceneIdList)
            } else{
                const length = sceneIdList.length
                for (let sceneId of sceneIdList) {
                    this.caseReferService.findSceneCase(sceneId.scene_id).then(res => {
                        result[sceneId.scene_name] = res
                        cache.push(sceneId.scene_name)
                        if (cache.length == length) {
                            resolve(result)
                        }
                    }).catch(err => {
                        this.sceneServiceLogger.error("get step data error","")
                        this.sceneServiceLogger.error(err,"")
                        reject(err)
                    })
                }
            }
        })
    }
}