import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "src/feature/common/prisma/prisma.service";
import { StepService } from "../step/step.service";

@Injectable()
export class CaseReferService {
    private caseReferLogger:Logger
    constructor(
        private readonly stepService:StepService,
        private readonly pgService:PostgresService
    ) {
        this.caseReferLogger = new Logger(CaseReferService.name)
    }

    // private async getCaseIdList(sceneData:SceneDto) {
    //     var caseIdList = []
    //     var length = sceneData.caseData.length
    //     return new Promise(async (resolve,reject) => {
    //         this.caseReferLogger.debug(`get sceneData.caseData: ${JSON.stringify(sceneData.caseData)}`)
    //         if (sceneData.caseData.length == 0) {
    //             resolve({
    //                 idList: caseIdList
    //             })
    //         }
    //         for (let case_ of sceneData.caseData) {
    //             try {
    //                 const res = await this.stepService.insertOneStep({
    //                     case_id: "ST" + random(10),
    //                     case_name: case_.apiConfig.url.split("/").reverse()[0],
    //                     skipped: case_.skipped?case_.skipped:false,
    //                     belong_module_id: sceneData.moduleId.toString(),
    //                     pre_fn: case_.preFn.toString(),
    //                     after_fn: case_.afterFn.toString(),
    //                     api_method: case_.apiConfig.method.toString(),
    //                     api_param: JSON.stringify(case_.apiConfig.param),
    //                     api_url: case_.apiConfig.url.toString(),
    //                     api_data: JSON.stringify(case_.apiConfig.data),
    //                     api_headers: JSON.stringify(case_.apiConfig.headers),
    //                     extract_spec: JSON.stringify(case_.extractSpec),
    //                     expect: JSON.stringify(case_.expect),
    //                     api_config: JSON.stringify(case_.apiConfig),
    //                     create_person: "default",
    //                     update_person: "default",
    //                     create_time: new Date(),
    //                     update_time: new Date()
    //                 })
    //                 caseIdList.push(res)
    //                 if (caseIdList.length == length) {
    //                     resolve({
    //                         idList: caseIdList
    //                     })
    //                 }
    //             } catch(err) {
    //                 reject(err)
    //             }
    //             // this.stepService.insertOneStep({
    //             //     case_id: "ST" + random(10),
    //             //     case_name: case_.apiConfig.url.split("/").reverse()[0],
    //             //     skipped: case_.skipped?case_.skipped:false,
    //             //     belong_module_id: sceneData.moduleId.toString(),
    //             //     pre_fn: case_.preFn.toString(),
    //             //     after_fn: case_.afterFn.toString(),
    //             //     api_method: case_.apiConfig.method.toString(),
    //             //     api_param: JSON.stringify(case_.apiConfig.param),
    //             //     api_url: case_.apiConfig.url.toString(),
    //             //     api_data: JSON.stringify(case_.apiConfig.data),
    //             //     api_headers: JSON.stringify(case_.apiConfig.headers),
    //             //     extract_spec: JSON.stringify(case_.extractSpec),
    //             //     expect: JSON.stringify(case_.expect),
    //             //     api_config: JSON.stringify(case_.apiConfig),
    //             //     create_person: "default",
    //             //     update_person: "default",
    //             //     create_time: new Date(),
    //             //     update_time: new Date()
    //             // }).then(res => {
    //             //     caseIdList.push(res)
    //             //     this.caseReferLogger.error(`call step service got ${JSON.stringify(caseIdList)}`)
    //             //     if (caseIdList.length == length) {
    //             //         resolve({
    //             //             idList: caseIdList
    //             //         })
    //             //     }
    //             // }).catch(err => {
    //             //     reject(err)
    //             // })
    //         }
    //     })
    // }

    // 创建场景<->用例的关联关系
    // createRelation(sceneMeta:SceneDto):Promise<Array<any>>{
    //     return new Promise(async (resolve,reject) => {
    //         var caseIdList = []
    //         if (sceneMeta.caseIds) {
    //             caseIdList = sceneMeta.caseIds  
    //         } else if (sceneMeta.caseData) {
    //             // 插入case_info
    //             try {
    //                 const caseArrData = await this.getCaseIdList(sceneMeta)
    //                 this.caseReferLogger.debug(`get case_info data ${JSON.stringify(caseArrData)}`)
    //                 caseIdList = caseArrData['idList']
    //             } catch(err) {
    //                 reject(err)
    //             }
    //         }
    //         var result = []
    //         try {
    //             for (let refer_case of caseIdList) {
    //                 // 插入case_refer
    //                 const relateionRecord:Prisma.case_referCreateInput = {
    //                     refer_id: "RELAT" + random(10),
    //                     case_refer_id: refer_case['case_id'],
    //                     belong_scene_id: sceneMeta.moduleId.toString(),
    //                     expect: JSON.stringify(refer_case['expect']),
    //                     api_config: JSON.stringify(refer_case['api_config']),
    //                     create_time: new Date(),
    //                     update_time: new Date()
    //                 }
    //                 result.push(
    //                     await this.pgService.case_refer.create({data: relateionRecord})
    //                 )
    //             }
    //             resolve(result)
    //         } catch(err) {
    //             reject(err)
    //         }
    //     })
    // }

    // 组装数据返回场景对应的case数据
    async findSceneCase(sceneId:String) {
        return new Promise(async (resolve,reject) => {
            // 根据scenid拿到relation表中的记录
            var sceneList = await this.pgService.at_scene_case_relation.findMany({
                where: {
                    scene_id: sceneId.toString()
                },
                orderBy: {
                    step_no:"asc"
                }
            })
            var result = {}
            var cache = []
            for (let relation of sceneList) {

                // 根据relation表中的caseid，去case_info找到元数据，并替换expect和apiconfig的值
                this.stepService.findByCaseId(relation.case_id).then(res => {
                    if (res) {
                        res['expect'] = relation.expect
                        res['extract_spec'] = relation.extract
                        res['api_config'] = relation.api_config
                        res['case_no'] = relation.step_no
                        res['case_name'] = relation.case_name
                        result[res['case_name']] = res
                    }
                    cache.push("caseName")
                    if (cache.length == sceneList.length) {
                        resolve(result)
                    }
                }).catch(err => {
                    this.caseReferLogger.error("find case data by id error","")
                    this.caseReferLogger.error(err,"")
                    reject(err)
                })
            }
        })
    }

    //  删除场景<->用例的关联关系
    async deleteRelatetionById(scenId:String) {

    }

    // 更新场景<->用例的关联关系
    async updateRelation() {

    }
    

}