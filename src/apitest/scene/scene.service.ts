import { Logger } from "@nestjs/common";
import { Injectable, Redirect } from "@nestjs/common/decorators";
import { PostgresService } from "common/prisma/prisma.service";
import { CaseReferService } from "./scene-case-relation.service";
import { SceneDataService } from "./scene-data.service";
import { Prisma } from "@prisma/client";
import { SceneServiceVO, SceneServiceDataListVO } from "./scene.vo";


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

    // 根据id获取场景信息
    async findById(sceneId:string) {
        
        let result:SceneServiceVO = {
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
    }

    // 根据场景名称获取场景的输入数据，用以做数据驱动
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


    // 根据id获取多个场景   
    async findSceneByModuleId(moduleId:String) {
        let result:SceneServiceDataListVO = {
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

    // 根据moduleId获取所有的场景用例数据，给上层module调用，data是{}格式
    async findMany(moduleId:String) {
        let result:SceneServiceVO = {
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
                let sceneIdExpect = (<Prisma.at_scene_infoCreateInput>sceneId)
                const caseInfoList = await this.caseReferService.findSceneCase(sceneIdExpect.scene_id)
                if (caseInfoList.error) {
                    this.sceneServiceLogger.error(`fetch caselist of scene failed.`,"")
                    result.error = caseInfoList.error
                    return result
                }
                if (result.data) {
                    result.data[sceneIdExpect.scene_name] = caseInfoList.data
                } else {
                    result.data = {
                        [sceneIdExpect.scene_name]: caseInfoList.data
                    }
                }
            }
        } catch(err) {
            result.error = err
        }
        return result
    }


    //  at_scene_info
    async createSceneInfo(sceneInfo: Prisma.at_scene_infoCreateInput) {
        let result:SceneServiceVO= {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_scene_info.create({
                data: sceneInfo
            })

        } catch(err) {
            this.sceneServiceLogger.error(`fetch scene info from db occur error ${err.message}`,err.stack)
            result.error = err
            return result
        }
        return result
    }

    async updateSceneInfo(condition: Prisma.at_scene_infoWhereUniqueInput, updateData: Prisma.at_scene_infoUpdateInput) {
        let result: SceneServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_scene_info.update({
                where: condition,
                data: updateData
            })
        } catch(err) {
            this.sceneServiceLogger.error(`update scene info occur error ${err.message}`,err.stack)
            result.error = err
        }
        return result
    }

    async deleteSceneInfo(condition: Prisma.at_scene_infoWhereUniqueInput) {
        let result:SceneServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_scene_info.delete({
                where: condition
            })
        } catch(err) {
            this.sceneServiceLogger.error(``)
            result.error = err
        }
        return result
    }

    async findSceneList() {
        let result: SceneServiceDataListVO = {
            error: null,
            data: []
        }
        try {
            result.data = await this.pgService.at_scene_info.findMany({
                where: {
                    scene_id: {not: ""},
                    scene_name: {not: ""}
                }
            })
            
        } catch(err) {
            this.sceneServiceLogger.error(`fetch all scene info occur error ${err.message}`,err.stack)
            result.error = err
        }
        return result
    }

    async findSceneInfoById(sceneId:string) {
        let result: SceneServiceVO = {
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
            result.error  = err
        }
        return result
    }
    
}