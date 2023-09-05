import { Logger } from "@nestjs/common"
import { type } from "os"

const runnerLogger = new Logger("RnnerUtil")

const getValueFromResp = (resp:{},key:string) =>  {
    var mapObj = JSON.parse(JSON.stringify(resp))
    if (key.includes(".")) {
        for (let part of key.split(".")) {
            let idx = parseInt(part)
            if (Number.isNaN(idx)) {
                if (mapObj[part] == undefined) {
                    return undefined
                }
                mapObj = mapObj[part]
            } else {
                if (mapObj[idx] == undefined) {
                    return undefined
                }
                mapObj = mapObj[idx]
            }
           
        }
        return mapObj
    }
    return resp[key]
}

// 获取url,body,header中的引用表达式
const findApiReferExpress = (target) => {
    runnerLogger.debug(`findApiRefer: ${target}`)
    if (!target)  {
        return null
    }
    const regex = /{{.*?}}/g
    const result = target.match(regex)
    return result
}

const parseExtendData = (location:string, data:Object) => {
    if (!location) {
        return null
    }
    if (!(typeof data == "object")) {
        runnerLogger.error("parse extend data failed for data is not object type","")
        return null
    }
    var result = JSON.parse(JSON.stringify(data))
    // console.log(`result : ${data}`)
    for (let part of location.split(".")) {
        if (!result) {
            return null
        }
        if (parseInt(part)) {
            result = result[parseInt(part)]
        } else {
            result = result[part]
        }
    }
    return result
}

const parseInnerData = (expression, dependency) => {
    // runnerLogger.error(dependency)
    if (!expression) {
        return null
    }
    if (!(dependency instanceof Object)) {
        runnerLogger.error("parse api inner dependency failed for dependency not object type","")
        return null
    }
    const refParts = expression.split(".")
    const varName = refParts.reverse()[0]

    // 拿到引用的字段所在的步骤,比如expression=a.b.c, extractKeyName=a.b
    const extractKeyName = expression.replace(`.${varName}`,"")
    const stepExtractList = dependency[extractKeyName]
    if (stepExtractList &&stepExtractList.length != undefined) {
        for (let varObj of stepExtractList) {
            if (varObj.name == expression) {
                return varObj.value
            }
        }
        runnerLogger.error(`parse inner data failed for not found refer ${expression}`,"")
        return null
    }
    // runnerLogger.error(`inner data ${JSON.stringify(dependency)}`)
    runnerLogger.error(`inner data not extract ${extractKeyName}`,"")
    return null
}

const getRefDenpendcyValue = (expression, dependency) => {
    if (!expression) {
        return null
    }
    const refParts = expression.split(".")
    switch(refParts[0]) {
        case "$datafile": {
            // 截取data.a.b.c中的a.b.c, 并传入外部数据，获取a.b.c的值
            // console.log(`extrend: ${expression.replace("data.","")}`)
            return parseExtendData(expression.replace("$datafile.",""),dependency['extendData'])
        }
        default: {
            return parseInnerData(expression,dependency['innerData'])
        }
    }    
}


const parameterizationAPI = (jsonString, dependency) => {
    
    if (!jsonString) {
        runnerLogger.error(`data parameterization jsonString got  [${jsonString}]`,"")
        return null
    }
    if (typeof jsonString != 'string') {
        jsonString = JSON.stringify(jsonString)
    }
    const refList = findApiReferExpress(jsonString)
    // runnerLogger.error(`refList ${refList}`)
    if (refList) {
        var flag = true
        for (let ref of refList) {
            const expression = ref.replace("{{","").replace("}}","")
            var refExpressValue = getRefDenpendcyValue(expression,dependency)
            runnerLogger.debug(`${expression} -> ${refExpressValue}`)
            if (!refExpressValue) {
                // 拿到的值是null,不做替换，接着下一个
                flag = false
                continue
            }
            if (refExpressValue instanceof Object) {
                refExpressValue = JSON.stringify(refExpressValue)
            }
            jsonString = jsonString.replace(ref, refExpressValue) 
        }
        // runnerLogger.error(`paramaterize string ${jsonString}`,"")
        if (!flag) {
            return null
        }
    }

    // if (!jsonString.includes("{") || !(jsonString[0] == "[")) {
    //     return jsonString
    // }
    try {
        switch(jsonString[0]) {
            case "{": return JSON.parse(jsonString)
            case "[": return JSON.parse(jsonString)
            default: return jsonString
        }
        // return JSON.parse(jsonString)
    } catch(err) {
        runnerLogger.error(`json parameterization failed, body String: \n${jsonString} \nparameterization error message: ${err.message}`,"")
        return null
    }
}

module.exports = {
    getValueFromResp,
    findApiReferExpress,
    getRefDenpendcyValue,
    parameterizationAPI
}