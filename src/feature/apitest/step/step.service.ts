import { Body, Injectable, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PostgresService } from "src/feature/common/prisma/prisma.service";

@Injectable()
export class StepService {
    constructor(
        private pgService:PostgresService
    ) {}


    async findMany(caseIdList:Array<String>) {
        return new Promise((resolve,reject) => {
            var result = {}
            var cache = []
            for (let caseId of caseIdList) {
                this.pgService.at_case_info.findFirst({
                    where: {
                        case_id: caseId.toString()
                    }
                }).then(res => {
                    if (!res){
                        reject(new Error(`get case data by id error. got ${res}`))
                    }
                    result[res['case_name']] = res
                    cache.push(res['case_name'])
                    if (cache.length == caseIdList.length) {
                        resolve(result)
                    }
                }).catch(err => {
                    reject(err)
                })
            }
            
        })
    }

    async findByCaseId(caseId:String) {
        return this.pgService.at_case_info.findFirst({
            where: {
                case_id: caseId.toString(),
                is_skip: 0
            }
        })
    }
}