import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "common/prisma/prisma.service";
import { SceneServiceDataListVO, SceneServiceVO } from "./scene.vo";
import { Prisma } from "@prisma/client";

@Injectable()
export class SceneDataService {
    private dataLogger:Logger
    constructor(private readonly pgService:PostgresService) {
        this.dataLogger = new Logger(SceneDataService.name)
    }
    
    // 根据id查找场景关联的数据
    async findSceneDataById(dataId:String) {
        let result:SceneServiceDataListVO = {
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


    // 更新单条测试数据
    async updateSceneData(condition: Prisma.at_scene_dataWhereUniqueInput, updateData:Prisma.at_scene_dataCreateInput) {
        let result:SceneServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_scene_data.update({
                where: condition,
                data: updateData
            })
        } catch(err) {
            this.dataLogger.error(`update scene data failed\n${JSON.stringify(updateData)}`, err.stack)
            result.error = err
        }
        return result
    }

    // 删除单条测试数据
    async deleteSceneData(condition: Prisma.at_scene_dataWhereUniqueInput) {
        let result:SceneServiceVO = {
            data: null,
            error: null
        }
        try {
            await this.pgService.at_scene_data.delete({
                where: condition
            })
        } catch(err) {
            this.dataLogger.error(`delete scene data with condition [${JSON.stringify(condition)}] failed`,err.stack)
            result.error = err
            return result
        }
    }

    // todo: 导入场景数据
    async importSceneData() {}

    // 创建单条测试数据
    async createSceneData(dataObject: Prisma.at_scene_dataCreateInput) {
        let result: SceneServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_scene_data.create({
                data: dataObject
            })
        } catch(err) {
            this.dataLogger.error(`create scene data error with data\n${JSON.stringify(dataObject)}`, err.stack)
            result.error = err
        }
        return result
    }
}