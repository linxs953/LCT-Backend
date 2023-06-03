const step = require("./step")
const qs = require("qs")
import { Logger } from "@nestjs/common"

export class Collection {
    collectionLogger:Logger
    collectionName:string
    steps: Array<any>
    stepRun: {}
    stepsExtract: {}
    runFails: {}
    status: boolean
    extendDependency: Array<any>
    
    constructor(name, sceneCaseConfig) {
        this.collectionLogger = new Logger(Collection.name)
        this.collectionName = name
        this.stepRun = {}
        this.stepsExtract = {}   
        this.runFails = {} 
        this.status = true
        this.extendDependency = []
        this.initStep(sceneCaseConfig)
    }

    initStep = (sceneCaseConfig) => {
        this.steps = []
        for (let caseConfig of sceneCaseConfig) {
            if (caseConfig.skip) {
                continue
            }
            this.steps.push(new step.Step(this.collectionName,caseConfig.caseName,
                caseConfig.apiConfig, caseConfig.preFn?new Function("return " + caseConfig.preFn):null, 
                caseConfig.afterFn?new Function("return " + caseConfig.afterFn):null, caseConfig.expect,
                 caseConfig.dependency, caseConfig.extractSpec
            ))
        } 
    }

    setExtendData = (data:Array<any>) => {
        
        this.extendDependency = data
    }

    collectionRun = async () => {
        var length = this.extendDependency.length
        if (length == 0) {
            length += 1
        }
        for (let idx =0;idx < length;idx ++) {
            var singleData = this.extendDependency[idx]
            for (let step of this.steps) {
                // 执行场景中的每一个步骤
                step.dependency = {
                    "extendData": singleData?singleData:{},
                    "innerData": this.stepsExtract
                }
                this.collectionLogger.log(`start request [${step.apiConfig.method}] ${step.apiConfig.url}`)
                const stepCaseResult = await step.executeCase()
                if (stepCaseResult.requestMeta.caseResult){
                    stepCaseResult.requestMeta.caseResult.isSuccess
                        ?this.collectionLogger.log(`[${step.name}] getResponse success`)
                        :this.collectionLogger.error(`[${step.name}] getResponse failed`,"")
                }
                if (stepCaseResult.runError) {
                    if (stepCaseResult.runError.preAction) {
                        this.collectionLogger.error(`[${step.name}]  preAction failed`,"")
                    }
                    if (stepCaseResult.runError.afterAction) {
                        this.collectionLogger.error(`[${step.name}]  afterAction failed`,"")
                    }
                }
                this.stepRun[step.name] = stepCaseResult['requestMeta']['caseResult']
                this.stepsExtract[step.name] = stepCaseResult.extract
                this.runFails[step.name] = stepCaseResult.runError
            }
            
            // 设置场景执行的运行结果
            for (let f of Object.keys(this.runFails)) {
                if (this.runFails[f].length == undefined) {
                    for (let k of Object.keys(this.runFails[f])) {
                        if (this.runFails[f][k]) {
                            this.status = false
                        }
                    }
                }
                if (this.runFails[f].length > 0) {
                    this.status = false
                }
            }

            return {
                "collectionResult": this.stepRun,
                "collectionExtract": this.stepsExtract,
                "collectionFailDetail": this.runFails,
                "collectionStatus": this.status
            }
        }
    }
}


// const config = [
//     {
//         "apiConfig": {
//             "method": "post",
//             "url": "https://apirestpre.chexinhui.com/v3/org/UserHkService/loginUserMobile",
//             "param": {},
            
//             "data": decodeURI(qs.stringify({"mobile": "{{data.username}}","pwd":"{{data.password}}"})),
//             "timeout": 5000,
//             "retryTimes": 5,
//             "headers": {
//                 "Content-Type": "application/x-www-form-urlencoded",
//                 "Accept": "application/json, text/plain, */*"
//             }
//         },
//         "preFn": () =>{},
//         "afterFn": () => {},
//         "expect": {
//             fieldExpect: [
//                 {
//                     "name":"token_type",
//                     "desire": "Bearer",
//                     "operation": "include"
//                 },
//                 {
//                     "name":"success",
//                     "desire": true,
//                     "operation": "equal"
//                 },
//                 {
//                     "name": "status",
//                     "desire": "200",
//                     "operation": "equal"
//                 }
//             ],
//             apiExpect: [
//                 {
//                     "assertType": "duration",
//                     "desire": 2000,
//                     "operation": "lte",
//                     "name": "resp.duration"
//                 },
//                 {
//                     "assertType": "statusCode",
//                     "desire": 200,
//                     "operation": "equal",
//                     "name": "resp.statusCode"
//                 }
//             ]
//         },
//         "dependency": {},
//         "extractSpec": [
//             {
//                 "variableName": "auth",
//                 "location": "access_token"
//             },
//             {
//                 "variableName": "type",
//                 "location": "token_type"
//             }
//         ]
//     },
//     {
//         "apiConfig": {
//             "method": "post",
//             "url": "https://apirestpre.chexinhui.com/v3/oa/OaWorkReportService/saveInsert",
//             "param": {},
//             "data": JSON.stringify({
//                 "reportType":"1",
//                 "reportTitle":"1",
//                 "reportProgress":"1",
//                 "reportPlan":"1",
//                 "reportImcomplete":"1",
//                 "reportProgram":"1",
//                 "reportTime":"2023-02-28 00:00:00",
//                 "reportUserfullname":"linqb",
//                 "reportUser":"11"
//             }),
//             "timeout": 5000,
//             "retryTimes": 0,
//             "headers": {
//                 "Content-Type": "application/json",
//                 "Accept": "application/json, text/plain, */*",
//                 "Authorization": "{{httpbin-test.loginUserMobile.type}} {{httpbin-test.loginUserMobile.auth}}"
//             }
//         },
//         "preFn": () =>{},
//         "afterFn": () => {},
//         "expect": {
//             fieldExpect: [
//                 {
//                     "name":"createPerson",
//                     "desire": "test01",
//                     "operation": "include"
//                 }
//             ],
//             apiExpect: [
//                 {
//                     "assertType": "duration",
//                     "desire": 2000,
//                     "operation": "lte",
//                     "name": "resp.duration"
//                 },
//                 {
//                     "assertType": "statusCode",
//                     "desire": 200,
//                     "operation": "equal",
//                     "name": "resp.statusCode"
//                 }
//             ]
//         },
//         "skip": false,
//         "dependency": {},
//         "extractSpec": [
//             {
//                 "variableName": "reportInfo",
//                 "location": "all",
//                 "type": "all"
//             },
//             {
//                 "variableName":"id",
//                 "location":"id"
//             }
//         ]
//     },
//     {
//         "apiConfig": {
//             "method": "post",
//             "url": "https://apirestpre.chexinhui.com/v3/oa/OaWorkReportService/delete",
//             "param": {
//                 "pk": "{{httpbin-test.saveInsert.id}}"
//             },
//             "data": "{{httpbin-test.saveInsert.reportInfo}}",
//             "timeout": 5000,
//             "retryTimes": 0,
//             "headers": {
//                 "Content-Type": "application/json",
//                 "Accept": "application/json, text/plain, */*",
//                 "Authorization": "{{httpbin-test.loginUserMobile.type}} {{httpbin-test.loginUserMobile.auth}}"
//             }
//         },
//         "preFn": () =>{},
//         "afterFn": () => {},
//         "expect": {
//             fieldExpect: [
//                 {
//                     "name":"message",
//                     "desire": "ok",
//                     "operation": "equal"
//                 },
//                 {
//                     "name":"success",
//                     "desire": true,
//                     "operation": "equal" 
//                 }
//             ],
//             apiExpect: [
//                 {
//                     "assertType": "duration",
//                     "desire": 2000,
//                     "operation": "lte",
//                     "name": "resp.duration"
//                 },
//                 {
//                     "assertType": "statusCode",
//                     "desire": 200,
//                     "operation": "equal",
//                     "name": "resp.statusCode"
//                 }
//             ]
//         },
//         "dependency": {},
//         "extractSpec": [],
//         "skip": false
//     }
// ]

// export const suitData = {
//     "name": "httpbin-test",
//     "data": config
// }
// new Collection(suitData.name,suitData.data).collectionRun().then(resp => {
//     if (resp.collectionStatus) {
//         console.log(resp.collectionRun)
//         console.log(JSON.stringify(resp.collectionExtract))
//         console.log("run collection success")
//     } else {
//         console.log("run collection failed")
//         // console.log(JSON.stringify(resp.collectionFailDetail))
//     }
// })

// module.exports = {
//     Collection
// }