

function parseTaskInfo2Dto(taskInfo) {
    var taskAllScene = {

    }
    if (!taskInfo || typeof(taskInfo) != "object") {
        return null
    }
    for (let scene of Object.keys(taskInfo)) {
        taskAllScene[scene] = []
        for (let step of Object.keys(taskInfo[scene])) {
            var singStep = {
                "apiConfig": JSON.parse(taskInfo[scene][step]['api_config']),
                "preFn": taskInfo[scene][step]['pre_fn'],
                "afterFn": taskInfo[scene][step]['after_fn'],
                "expect": JSON.parse(taskInfo[scene][step]['expect']),
                "dependency": {},
                "extractSpec": JSON.parse(taskInfo[scene][step]['extract_spec']),
                "skipped": false   
            }
            taskAllScene[scene].push(singStep)
        }
    }
    return taskAllScene
}


// function orderStepList(steps:Array<any>) {
//     for (let st of steps) {
//         if (st.)
//     }
// }

export function sceneInfo2Dto(sceneInfo) {
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