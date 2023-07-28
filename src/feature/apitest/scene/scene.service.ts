import { Logger } from "@nestjs/common";
import { Injectable, Redirect } from "@nestjs/common/decorators";
import { PostgresService } from "src/feature/common/prisma/prisma.service";
import { CaseReferService } from "./scene-case-relation.service";
import { SceneDataService } from "./scene-data.service";
import { Prisma } from "@prisma/client";
import { FindSceneAllCaseVO, FindSceneRecordVO, FindSceneRecordsVO } from "./scene.vo";


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
        
        let result:FindSceneRecordVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_scene_info.findFirst({
                where: {
                    scene_id: sceneId
                }
            })
            
        } catch(err) {
            this.sceneServiceLogger.error(`find scene info with [sceneId=${sceneId}] failed\n${err.message}`)
            result.error = err
        }
        return result
        // return this.pgService.at_scene_info.findFirst({
        //     where: {
        //         scene_id: sceneId
        //     }
        // })
    }

    async findSceneDataByName(sceneName:String) {
        let result = {
            data: null,
            error: null
        }
        try {
            const sceneInfo = await this.pgService.at_scene_info.findFirst({
                where: {
                    scene_name: sceneName.toString()
                }
            })
            const sceneDataInfo = await this.dataService.findSceneDataById(sceneInfo.data_id)
            if (sceneDataInfo.error) {
                this.sceneServiceLogger.error(`get scene related data failed`,"")
                result.error = sceneDataInfo.error
                return result
            }
            result.data = sceneDataInfo.data
        } catch(err) {
            this.sceneServiceLogger.error(`find scene info with [sceneNam=${sceneName}] failed\m${err.message}`,"")
            result.error = err
        }
        return result
    }

    async findSceneByModuleId(moduleId:String) {
        let result:FindSceneRecordsVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_scene_info.findMany({
                where: {
                    module_id: moduleId.toString(),
                    is_enable: 1
                }
            })
            
        } catch(err) {
            this.sceneServiceLogger.error(`find scene info list with [moduleId=${moduleId}] failed\n${err.message}`,"")
            result.error = err
        }
        return result
    }

    async findMany(moduleId:String) {
        let result:FindSceneAllCaseVO = {
            data: null,
            error: null
        }
        
        // 去scene_info查找同个moduleid的所有记录
        try {
            let sceneIdList = await this.findSceneByModuleId(moduleId)
            if (sceneIdList.error) {
                result.error  = sceneIdList.error
                return result
            }
            for (let sceneId of sceneIdList.data) {
                const caseInfoList = await this.caseReferService.findSceneCase(sceneId.scene_id)
                if (caseInfoList.error) {
                    this.sceneServiceLogger.error(`fetch caselist of scene failed.`,"")
                    result.error = caseInfoList.error
                    return result
                }
                if (result.data) {
                    result.data[sceneId.scene_name] = caseInfoList.data
                } else {
                    result.data = {
                        [sceneId.scene_name]: caseInfoList.data
                    }
                }
            }
        } catch(err) {
            result.error = err
        }
        return result
    }
}