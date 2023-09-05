import { Prisma } from "@prisma/client"


/* 
    用例统计util 
*/
export class CaseStatics {
    static getErrorNum(errorDetail:any,scene:string=null) {
        if (errorDetail) {
            if (scene) {
                errorDetail = errorDetail[scene]
            }
            let count = 0
            Object.keys(errorDetail).map(caseName => {
                if (Object.keys(errorDetail[caseName]).length > 0) {
                    // caseStaticsLogger.error(errorDetail[caseName])
                    count += 1 
                }
            })
            return count
        } else {
            return 0
        }
    }
    
    static getSceneCaseNum(obj:any,scene:string=null) {
        let count = 0
        if (obj && typeof(obj) == "object") {
            if (scene) {
                Object.keys(obj[scene]).map(cc => {
                    count += 1
                })   
            } else {
                Object.keys(obj).map(scene => {
                    Object.keys(obj[scene]).map(cc => {
                        count += 1
                    })
                })
            }
        }
        return count
    }
}



/* 
    数据转换util  
*/
export class SceneDataTrans {
    static sceneInfo2Dto(sceneInfo) {
        var result = []
        // console.log(JSON.stringify(sceneInfo))
        for (let step of Object.keys(sceneInfo)) {
            var stepMeta = {
                "apiConfig": JSON.parse(sceneInfo[step]['api_config']),
                "preFn": sceneInfo[step]['pre_fn'],
                "afterFn": sceneInfo[step]['after_fn'],
                "expect": JSON.parse(sceneInfo[step]['expect']),
                "dependency": {},
                "extractSpec": JSON.parse(sceneInfo[step]['extract_spec']),
                "skipped": false,
                "caseNo": sceneInfo[step]['case_no'],
                "caseName": sceneInfo[step]['case_name']
            }
            // stepMeta['apiConfig'] = JSON.parse(stepMeta['apiConfig'])
            // stepMeta['expect'] = JSON.parse(stepMeta['expect'])
            // stepMeta['extractSpec'] = JSON.parse(stepMeta['extractSpec'])
            result.push(stepMeta)
        }
        for (let idx=0;idx < result.length-1;idx++) {
            for (let ndx=idx+1;ndx < result.length;ndx++) {
                if (parseInt(result[idx].caseNo,10) > parseInt(result[ndx].caseNo,10)) {
                    const temp = result[idx]
                    result[idx] = result[ndx]
                    result[ndx] = temp
                }
            }
        }
        return result
    }
}



/*
    任务运行记录解析
*/ 
export class TaskRunRecordParser {
    static recordParse(source:{},returnResult:{},fileter=[]) {
        for (let scene of source['nameList']) {
            let allCaseNumOfScene = CaseStatics.getSceneCaseNum(source['error'],scene)

            // 如果执行成功，拿runResultDetail
            allCaseNumOfScene = allCaseNumOfScene?allCaseNumOfScene:CaseStatics.getSceneCaseNum(source['result'],scene)
            const sceneFailedNum = CaseStatics.getErrorNum(source['error'], scene)
            const sceneSuccessNum = allCaseNumOfScene - sceneFailedNum            
            returnResult['sceneInfoList'].push({
                sceneName: scene,
                execSuccessNum: sceneSuccessNum,
                execFailNum: sceneFailedNum,
                sceneTotalNum: allCaseNumOfScene,
                runStatus: sceneFailedNum > 0?false:true
            })

            let caseList:any
            if (Object.keys(source['error'][scene]).length > Object.keys(source['result'][scene]).length) {
                caseList = Object.keys(source['error'][scene])
            } else {
                caseList = Object.keys(source['result'][scene])
            }


            for (let caseName of caseList) {
                // errorDetail的key是阶段，值是错误信息
                const stage =  (source['error'][scene][caseName]&&Object.keys(source['error'][scene][caseName]).length>0)?
                                    Object.keys(source['error'][scene][caseName]).toString():
                                    "success"
                let errorInfo = (source['error'][scene][caseName]&&source['error'][scene][caseName])?
                                    source['error'][scene][caseName][stage]:
                                    null
                const resultInfo =  (source['result'][scene][caseName]&&source['result'][scene][caseName])?
                                    source['result'][scene][caseName]:
                                    null
                if (errorInfo) {
                    switch(typeof(errorInfo['resp'])) {
                        // 结果是字符串，可能出现在预处理阶段
                        case "string": {
                            errorInfo = errorInfo['resp']
                            break
                        }
                        // 结果是对象，可能出现在请求阶段getResponse或者在verify阶段
                        case "object": {
                            if (errorInfo['resp']['error']) {
                                errorInfo = errorInfo['resp']['error']['result']
                            } else {
                                // 断言失败
                                errorInfo = errorInfo['assertFailDetail']
                            }
                            break
                        }
                    }
                } else {
                    errorInfo = null
                }

                // 根据errorInfo判断是否运行是否成功
                const runStatus = errorInfo?false:true

                // 组装场景运行结果taskRunList
                const stepResult =  {
                    sceneName: scene,
                    stepName: caseName,
                    runStatus: runStatus,
                    stage: stage,
                    error: errorInfo,

                    // 拿成功的response，没有就拿失败的结果
                    result: resultInfo&&resultInfo['response']?
                                resultInfo['response']:
                                ((resultInfo&&resultInfo['error']['result'])?
                                resultInfo['error']['result']:resultInfo)
                }
                returnResult['allSceneList'].push(stepResult)
            }
            
        }
        return returnResult
    }
}

