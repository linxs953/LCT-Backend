
export function getErrorNum (errorDetail:any,scene:string=null) {
    
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


export function getSceneCaseNum(obj:any,scene:string=null) {
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