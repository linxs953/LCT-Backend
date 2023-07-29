import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "src/common/prisma/prisma.service";
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

    // 组装数据返回场景对应的case数据
    async findSceneCase(sceneId:String) {

        let result = {
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

    //  删除场景<->用例的关联关系
    async deleteRelatetionById(scenId:String) {

    }

    // 更新场景<->用例的关联关系
    async updateRelation() {

    }
    

}