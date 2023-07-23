

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