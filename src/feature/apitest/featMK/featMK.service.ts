import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "src/common/prisma/prisma.service";
import { SceneService } from "../scene/scene.service";
import { Prisma } from "@prisma/client";
import { FeatMKServiceVO, FeatMkServiceDataListVO } from "./featMK.vo";

@Injectable()
export class FeatMKService {
    private mkServiceLogger:Logger
    constructor(
        private pgService:PostgresService,
        private sceneService:SceneService
        ) {
            this.mkServiceLogger = new Logger(FeatMKService.name)
    }

    // 获取所有的模块
    async findModuleList() {
        let result:FeatMkServiceDataListVO = {
            data: [],
            error: null
        }
        try {
            result.data = await this.pgService.at_module_info.findMany({
                where: {
                    module_id: {not: ""},
                    module_name: {not: ""},
                    business_name: {not: ""},
                    module_owner: {not: ""}
                }
            })
            return result
        } catch(err) {
            this.mkServiceLogger.error(`fetch module list failed`, err)
            result.error = err
        }
        return result
    }


    // 查找所有关联的场景
    async findMany(moduleList:Array<String>) {
        let result:FeatMKServiceVO = {
            data: null,
            error: null
        }
        for (let mid of moduleList) {
            try {
                const module = await this.pgService.at_module_info.findFirst({
                    where: {
                        module_id: mid.toString()
                    }
                })
                const res = await this.sceneService.findMany(mid)
                if (res.error) {
                    result.error = res.error
                    return result
                }
                if (!result.data) {
                    result.data = {
                        [module.module_name]: res.data
                    }
                } else {
                    result.data[module.module_name] = res.data
                }
            } catch(err) {
                this.mkServiceLogger.error(`find module info  with [moduldId=${mid}] occur error`, err.stack)
                result.error = err
                return result
            }
        }
        return result
    }

    // 通过id获取模块信息
    async findById(moduleId:string) {
        let result:FeatMKServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_module_info.findFirst({
                where: {
                    module_id: moduleId
                }
            })
            return result
        } catch(err) {
            this.mkServiceLogger.error(`find module info with [moduleId=${moduleId}] failed`,err.message)
            result.error = err
            return result
        }        
    }


    // 创建模块
    async createModule(moduleInfo:Prisma.at_module_infoCreateInput) {
        let result:FeatMKServiceVO = {
            data: null,
            error: null
        }
        try {
            if (moduleInfo.module_id || moduleInfo.module_name || moduleInfo.business_name) {
                this.mkServiceLogger.error(`moduleInfo data is invalid [${JSON.stringify(moduleInfo)}]`,"")
                result.error = new Error(`moduleInfo data is invalid [${JSON.stringify(moduleInfo)}]`)
                return result
            }
            await this.pgService.at_module_info.create({
                data: moduleInfo
            })
            return result
        } catch(err) {
            this.mkServiceLogger.error(`create module failed with data ----- ${JSON.stringify(moduleInfo)}`,err)
            result.error = err
            return result
        }
    }


    // 更新模块
    async updateModule(condition:Prisma.at_module_infoWhereUniqueInput ,updateInfo:Prisma.at_module_infoCreateInput) {
        let result:FeatMKServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_module_info.update({
                data: updateInfo,
                where: condition
            })
        } catch(err) {
            this.mkServiceLogger.error(`update module failed with [moduleId=${updateInfo.module_id}]`,err)
            result.error = err
        }
        return result
    }


    // 删除模块
    async deleteModule(moduleId:string) {
        let result:FeatMKServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_module_info.delete({
                where: {
                    module_id: moduleId
                }
            })
        } catch(err) {
            this.mkServiceLogger.error(`delete module info with [moduleId=${moduleId}] failed`)
            result.error = err
        }
        return result
    }
}