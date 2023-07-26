import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "src/feature/common/prisma/prisma.service";
import { SceneService } from "../scene/scene.service";

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
        return new Promise(async (resolve,reject) => {
            var result = {}
            var cache = []
            for (let mid of moduleList) {
                const module = await this.pgService.at_module_info.findFirst({
                    where: {
                        module_id: mid.toString()
                    }
                })
                this.sceneService.findMany(mid).then(res => {
                    result[module.module_name] = res
                    cache.push(mid)
                    if (cache.length == moduleList.length) {
                        resolve(result)
                    }
                }).catch(err => {
                    this.mkServiceLogger.error("call sceneService error","")
                    this.mkServiceLogger.error(err,"")
                    reject(err)
                })
            }
        })
    }


    async findById(moduleId:string) {
        return this.pgService.at_module_info.findFirst({
            where: {
                module_id: moduleId
            }
        })
    }
}