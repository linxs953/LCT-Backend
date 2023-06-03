import { Injectable } from "@nestjs/common";
import { PostgresService } from "src/feature/common/prisma/prisma.service";

@Injectable()
export class SceneDataService {

    constructor(private readonly pgService:PostgresService) {
        
    }


    findAllSceneData() {
        return new Promise((resolve,reject) => {
            this.pgService.atui_case_data.findMany({
                where: {
                    enable: 1
                }
            }).then((res: string | any[]) => {
                if (!res || res.length ==  0) {
                    reject(new Error("not found ui case data"))
                }
                let sceneDataMap = {}
                for (let dd of res) {
                    if (!sceneDataMap[dd['business_name']]) {
                        sceneDataMap[dd['business_name']] = {}
                    }
                    if (!sceneDataMap[dd['business_name']][dd['module_name']]) {
                        sceneDataMap[dd['business_name']][dd['module_name']] = {}
                    }
                    const scene = sceneDataMap[dd['business_name']][dd['module_name']][dd['scene_name']]
                    if (!scene) {
                        sceneDataMap[dd['business_name']][dd['module_name']][dd['scene_name']] = []
                    }
                    sceneDataMap[dd['business_name']][dd['module_name']][dd['scene_name']].push(JSON.parse(dd['row_value']))
                    
                }
                resolve(sceneDataMap)
                
            }).catch((err: any) => {
                reject(err)
            })
        })
    }

}