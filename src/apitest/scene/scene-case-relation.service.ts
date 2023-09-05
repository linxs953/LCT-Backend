import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "common/prisma/prisma.service";
import { StepService } from "../step/step.service";
import { SceneServiceVO } from "./scene.vo";
import { Prisma, at_scene_case_relation } from "@prisma/client";
import { CreateRelationDto } from "./scene.dto";
let random = require("string-random")
let sd = require("silly-datetime")

@Injectable()
export class CaseReferService {
    private caseReferLogger:Logger
    constructor(
        private readonly stepService:StepService,
        private readonly pgService:PostgresService
    ) {
        this.caseReferLogger = new Logger(CaseReferService.name)
    }

    // 组装数据返回场景对应的case数据, result.data结构是{}
    async findSceneCase(sceneId:String) {

        let result:SceneServiceVO = {
            data: null,
            error: null
        }
        try {
            const sceneList = await this.pgService.at_scene_case_relation.findMany({
                    where: {
                        scene_id: sceneId.toString()
                    },
                    orderBy: {
                        step_no:"asc"
                    }
            })
            for (let relation of sceneList) {
                // 根据relation表中的caseid，去case_info找到元数据，并替换expect和apiconfig的值
                let stepInfo = await this.stepService.findByCaseId(relation.case_id)
                if (stepInfo.error) {
                    result.error = stepInfo.error
                    return result
                }
                if (stepInfo.data) {
                    stepInfo.data['expect'] = relation.expect
                    stepInfo.data['extract_spec'] = relation.extract
                    stepInfo.data['api_config'] = relation.api_config
                    stepInfo.data['case_no'] = relation.step_no
                    stepInfo.data['case_name'] = relation.case_name
                }
                if (!result.data) {
                    result.data = {
                        [stepInfo.data['case_name']]: stepInfo.data
                    }
                }else {
                    result.data[stepInfo.data['case_name']] = stepInfo.data
                }
            }
            
        } catch(err) {
            this.caseReferLogger.error(`find scene relation record failed with [sceneId=${sceneId}]\n${err.message}`,"")
            result.error = err
        }
        return result
    }

    // 传入一个sceneId和一个caseId列表
    async createSceneRelation(relationObject: CreateRelationDto) {
        let result:SceneServiceVO = {
            data: null,
            error: null
        }
        let dd:Array<Prisma.at_scene_case_relationCreateInput> = []
        try {
            for (let caseIdx = 0;caseIdx < relationObject.caseIdList.length;caseIdx++){

                // 根据caseid获取用例信息
                    const caseInfo = await this.stepService.findByCaseId(relationObject.caseIdList[caseIdx])
                    if (caseInfo.error) {
                        this.caseReferLogger.error(`fetch case info with [id=${relationObject.caseIdList[caseIdx]}] failed`,caseInfo.error.stack)
                        result.error = caseInfo.error
                        return result
                    }
                    const caseInfoExpect = <Prisma.at_case_infoCreateInput>caseInfo.data

                    // 根据拿到的用例信息，组装关联表的数据
                    const relationData:Prisma.at_scene_case_relationCreateInput = {
                        id: random(10),
                        scene_id: relationObject.sceneId,
                        case_id: caseInfoExpect.case_id,
                        expect: caseInfoExpect.expect,
                        api_config: caseInfoExpect.api_config,
                        create_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm'),
                        modify_time: sd.format(new Date(), 'YYYY-MM-DD HH:mm'),
                        create_person: "admin",
                        modify_person: "admin",
                        case_name: caseInfoExpect.case_name,
                        step_no: caseIdx,
                        extract: caseInfoExpect.extract_spec
                    }
                    dd.push(relationData)
                }

                // 调用pgService的多条数据插入方法
                result.data = await this.pgService.at_scene_case_relation.createMany({
                    data: dd
                })
                return result
        } catch(err) {
            this.caseReferLogger.error(`create scene case relation failed`,err.stack)
            result.error = err
        }
        
        return result    
    }

    // 根据sceneid和caseid更新关联关系
    async updateSceneRelation(condition:Prisma.at_scene_case_relationWhereInput, updateRelation:Prisma.at_scene_case_relationUpdateInput) {
        let result:SceneServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_scene_case_relation.updateMany({
                where: condition,
                data: updateRelation
            })
        } catch(err) {
            this.caseReferLogger.error(`update scene relation failed with data ${JSON.stringify(updateRelation)}`,err.stack)
            result.error = err
        }
        return result
    }

    // 根据sceneId删除relation
    async deleteSceneRelation(condition:Prisma.at_scene_case_relationWhereInput) {
        let result:SceneServiceVO = {
            data: null,
            error: null
        }
        
        try {
            await this.pgService.at_scene_case_relation.deleteMany({
                where: {
                    scene_id: condition.scene_id
                }
            })
        } catch(err) {
            this.caseReferLogger.error(`delete scene relation with ${JSON.stringify(condition)} failed`,err.stack)
            result.error = err
        }
        return result
    }

    // 根据sceneId查找scene relation
    async findSceneRelation(condition:Prisma.at_scene_case_relationWhereInput) {
        let result:SceneServiceVO = {
            data: null,
            error: null
        }
        try {
            result.data = await this.pgService.at_scene_case_relation.findFirst({
                where: condition
            })
        } catch(err) {
            this.caseReferLogger.error(`find scene relation with ${JSON.stringify(condition)}}] failed `,err.stack)
            result.error = err
        }
        return result
    }
    

}