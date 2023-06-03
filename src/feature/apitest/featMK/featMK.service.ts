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

    
    // async create(newModule:Prisma.module_infoCreateInput) {
    //     return new Promise((resolve,reject) => {

    //         try {
    //             this.pgService.module_info.create({
    //                 data: newModule
    //             }).then(res => {
    //                 resolve(res)
    //             }).catch(err => {
    //                 reject(err)
    //             })
    //         } catch(err) {
    //             reject(err)
    //         }
    //     })
    // }

    // async findModuleById(moduleId:String) {
    //     return this.pgService.module_info.findFirst({
    //         where: {
    //             module_id: String(moduleId)
    //         },
    //         select: {
    //             module_id: true,
    //             module_name: true,
    //             scene_list: true,
    //             business_name: true,
    //             module_owner: true,
    //         }
    //     })
    // }

    // async updateModule(moduleId, updateModuleData:Prisma.module_infoUpdateInput) {
    //     return this.pgService.module_info.update({
    //         data: updateModuleData,
    //         where: {
    //             module_id: moduleId
    //         }
    //     })
    // }


    async findMany(moduleList:Array<String>) {
        return new Promise(async (resolve,reject) => {
            var result = {}
            var cache = []
            for (let mid of moduleList) {
            //    const mkData = await this.pgService.scene_info.findMany({
            //         where: {
            //             module_id: mid.toString()
            //         },
            //     })
                
                // var sceneIdList = []
                // for (let sceneRecord of mkData) {
                //     sceneIdList.push(sceneRecord.scene_id)
                // }
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

}