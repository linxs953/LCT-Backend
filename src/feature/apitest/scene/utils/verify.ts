export const check = (sceneDto)=> {
    var err = null
    if (!sceneDto.sceneName || sceneDto.sceneName == "") {
        err = new Error("scene name not specified")
    }
    if (!sceneDto.caseData && !sceneDto.caseIds) {
        err= new Error("field caseData or caseIds not specified")
    }
    if (sceneDto.caseData) {
        if (sceneDto.caseData.length == undefined) {
            err = new Error("caseData type must be Array")
        } else {
            for (let d of sceneDto.caseData) {
                if (!d.apiConfig) {
                    if (!d.apiConfig.method || !d.apiConfig.url || !d.apiConfig.headers) {
                        err = new Error("method / url / header for apiConfig must not null")
                    }
                    if (typeof(d.apiConfig.timeout) != "number" || typeof(d.apiConfig.retryTimes) != "number") {
                        err = new Error("timeout / retryTimes for apiConfig must be number")
                    }
                }
                if (d.expect) {
                    for (let fa of d.expect.fieldExpect) {
                        if (!fa.name || !fa.desire || !fa.operation) {
                            err = new Error(`fieldExpect parse error for ${JSON.stringify(fa)}`)
                        }
                    }
                    for (let ae of d.expect.apiExpect) {
                        if (!ae.name || !ae.desire || !ae.operation || !ae.assertType) {
                            err = new Error(`apiExpect parse error for ${JSON.stringify(ae)}`)
                        }
                    }
                }
                if (d.extractSpec) {
                    for (let es of d.extractSpec) {
                        if (!es.variableName || !es.location ) {
                            err = new Error(`exreactSpec parse error for ${JSON.stringify(es)}`)
                        }
                    }
                }
            }
        }
    }
    if (sceneDto.caseIds) {
        if (sceneDto.caseIds.length == undefined) {
            err = new Error("caseIds type must be array")
        }
    }
    
    return err
}

