import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "src/feature/common/prisma/prisma.service";
import { SceneService } from "../scene/scene.service";
import { Prisma } from "@prisma/client";
import { FindModuleInfoRecordVO, FindModuleInfoRecordsVO } from "./featMK.vo";

@Injectable()
export class FeatMKService {
    private mkServiceLogger:Logger
    constructor(
        private pgService:PostgresService,
        private sceneService:SceneService
        ) {
            this.mkServiceLogger = new Logger(FeatMKService.name)
    }


    async findMany(moduleList:Array<String>) {
        let result:FindModuleInfoRecordsVO = {
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
                // cache.push(mid)
                // if (cache.length == moduleList.length) {
                //     return result
                // }
                // this.sceneService.findMany(mid).then(res => {
                //     result[module.module_name] = res
                //     cache.push(mid)
                //     if (cache.length == moduleList.length) {
                //         return result
                //     }
                // }).catch(err => {
                //     this.mkServiceLogger.error("call sceneService error","")
                //     this.mkServiceLogger.error(err,"")
                //     throw err
                // })
            } catch(err) {
                this.mkServiceLogger.error(`find module info  with [moduldId=${mid}] occur error`, err.stack)
                result.error = err
                return result
            }
        }
        return result
    }


    async findById(moduleId:string) {
        let result:FindModuleInfoRecordVO = {
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
}