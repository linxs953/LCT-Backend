import { Logger } from "@nestjs/common"
import AxiosRequest from "./request";
const assert_ = require("./utils/assert")
const runnerUtil = require("./utils/runner")

class Step {
    private readonly logger:Logger
    name:string
    apiConfig:any
    preFn:Function
    afterFn:Function
    assertStatus: boolean
    assertFail: {}
    // runError: Array<any>
    expect: {}
    dependency: {}
    extractSpec: []
    extract:Array<{}>
    
    
    constructor(collectionName, stepName,apiConfig, preFn, afterFn, expect, dependency,extractSpec) {
        this.logger = new Logger(Step.name)
        this.apiConfig = apiConfig
        this.preFn = preFn
        this.afterFn = afterFn
        this.expect = expect
        this.dependency = dependency
        this.assertFail = {}
        this.assertStatus = true
        this.name = `${collectionName}.${stepName}`
        this.extractSpec = extractSpec
        this.extract = []
        // this.runError = []
    }


    // reset = () => {
    //     this.extract = []

    // }
    getStepName = (collectionName, apiKey) => {
        if (collectionName) {
            return `${collectionName}.${apiKey}`
        }
        return apiKey
    }

    extractFields = (execRs) => {
        if (!execRs) {
            return
        }
        for (let ext of this.extractSpec) {
            const resp = execRs['requestMeta']['caseResult']['response']
            var extractObj = {
                "name": this.name + "." + ext['variableName'],
                "value": runnerUtil.getValueFromResp(resp, ext['location'])
            }
            if (ext['type'] == "all") {
                extractObj['value'] = resp   
            }
            this.extract.push(extractObj)
        }
        // this.logger.debug(`extract field ${JSON.stringify(this.extract)}`)
    }

    // 1. 处理参数化数据逻辑 2. 进行一些其他的前置操作
    preAction () {
        try {
            if (this.preFn) {
                this.preFn()
            }
        } catch(err) {
            console.log(`preFun call failed. for ${err.message}`)
            return err.message
        }        


        this.logger.log(`start paramaterize for [${this.name}]`)
        // 处理body的ref
        var newBody = runnerUtil.parameterizationAPI(this.apiConfig.data, this.dependency)
        if (!newBody) {
            this.logger.error(`[${this.name}] body parameterization failed`,"")
            return new Error("body parameterization error").message
        }

        // 处理headers的ref
        var newHeaders = runnerUtil.parameterizationAPI(JSON.stringify(this.apiConfig.headers), this.dependency)
        if (!newHeaders) {
            this.logger.error(`[${this.name}] headers parameterization failed`,"")
            return new Error("header parameterization error").message
        }

        // 处理url的ref
        var parameterURL = runnerUtil.parameterizationAPI(this.apiConfig.url, this.dependency)
        if (!parameterURL) {
            this.logger.error(`[${this.name}] request-url parameterization failed`,"")
            return new Error("url parameterization error").message
        }

        var newParam = runnerUtil.parameterizationAPI(JSON.stringify(this.apiConfig.param),this.dependency)
        if (!newParam) {
            this.logger.error(`[${this.name}] param parameterization failed`,"")
            return new Error("param parameterization error").message
        }

        var newExtract = runnerUtil.parameterizationAPI(JSON.stringify(this.extractSpec),this.dependency)
        if (!newExtract) {
            this.logger.error(`[${this.name}] param parameterization failed`,"")
            return new Error("extract_spec parameterization error").message
        }

        var newExpect = runnerUtil.parameterizationAPI(JSON.stringify(this.expect),this.dependency)
        if (!newExpect) {
            if (!newExpect) {
                this.logger.error(`[${this.name}] param parameterization failed`,"")
                return new Error("expect parameterization error").message
            }
        }
        
        this.extractSpec = newExtract
        this.expect = newExpect
        this.apiConfig['url'] = parameterURL
        this.apiConfig['data'] = newBody
        this.apiConfig['headers'] = newHeaders
        this.apiConfig['param'] = newParam
        this.logger.log(`[${this.name}] finish paramaterize`)
        return null 
    }
    
    // 1. 清除数据 2. 进行其他的一些后置操作
    afterAction () {
        try {
            if (this.afterFn) {
                this.afterFn()
            }
            return null
        } catch(err) {
            console.log(`afterFn call failed. for ${err.message}`)
            return err
        }
    }

    /*执行用例后的返回结构
        {
            hooksError: {
                pre: null,
                after: null
            }
            requestMeta: {
                caseResult: {},
                caseConfig: {}
            }
            verify: {
                assertStatus: true,
                assertDesire: [],
                assertFail: [{
                    "desire": desireValue,
                    "actualValue": actualValue,
                    "operation": operation,
                    "reason": "match failed"
                }]
            }
        }
    */
    // 运行接口用例, pre->run->assert->after->extract
    executeCase = async () => {
        var execRs = {
            // hooksError: {},
            requestMeta: {},
            verify: {},
            runError: {},
            extract: {}
        }

        // 调用前置hooks
        const preErr = this.preAction()
        // this.logger.error(`preaction error: ${JSON.stringify(preErr)}`)
        if (preErr) {
            execRs.runError['preAction'] = {
                "stepName": this.name,
                "resp": preErr,
            }
            // this.logger.error(`pre err`)
            // this.logger.error(JSON.stringify(execRs.runError))
            return execRs
        }
        // execRs['hooksError']['pre'] = this.preAction()
        // if (execRs['hooksError']['pre']) {
        //     this.runError.push({
        //         "stepName": this.name,
        //         "resp": execRs['hooksError']['pre'],
        //         "currentNode": "preAction"
        //     })
        //     return execRs
        // }

        // 后面考虑在request模块加个callback
        var request = new AxiosRequest(this.apiConfig)
        const resp = await request.sendRequest()
        execRs['requestMeta'] = resp

        // 接口调用有错误： 请求发送失败/状态码错误/其他错误
        if (resp.caseResult.error) {
            execRs.runError['getResponse'] = {
                "stepName": this.name,
                "resp": resp.caseResult,
            }
            const err = this.afterAction()
            if (err) {
                // 执行后置操作失败，有错误
                execRs.runError['afActionNextGetResponse'] = {
                    "stepName": this.name,
                    "resp": err,
                }
            }
            return execRs
        }
        
        this.extractFields(execRs)
        this.logger.log(`[${this.name}] extract: ${JSON.stringify(this.extract)}`)
        execRs.extract = this.extract

        this.assert(resp['caseResult'])
        
        // 断言失败 ?? 后面改成直接放在execRs里面，不从this里面获取
        if (!this.assertStatus) {
            execRs.runError['verify'] = {
                "stepName": this.name,
                "resp": resp.caseResult,
                "assertFailDetail": this.assertFail
            }
            // execRs['runError'].push({

            // })
        }
        
        execRs['verify'] = {
            assertStatus:  this.assertStatus,
            expectDesire: this.expect,
            expectFail: this.assertFail
        }

        // 调用后置hooks
        const atError = this.afterAction()
        if (atError) {
            execRs.runError['afterAction'] = {
                "stepName": this.name,
                "resp": atError,
            }
            // execRs.runError.push({
            //     "currentNode": "afterAction",
            // })
        }
        // execRs['hooksError']['after'] = this.afterAction()
        // if(execRs['hooksError']['after']) {
        //     this.runError.push({
        //         "stepName": this.name,
        //         "resp": resp.caseResult,
        //         "currentNode": "afterAction",
        //     })
        //     return execRs
        // }

        // execRs['runError'] = this.runError
        // this.logger.error(`step execute : ${JSON.stringify(execRs)}`)
        // this.logger.error(execRs.runError)
        return execRs
    }

    // 接口结果断言
    assert = (result) => {
        const resp = result['response']
        for (let ex of this.expect['apiExpect']) {
            const desire = ex['desire']
            this.apiAssert(result,String(desire),ex['assertType'],ex['operation'])
        }

        for (let ex of this.expect['fieldExpect']) {
            const desire = ex['desire']
            const actualValue = runnerUtil.getValueFromResp(resp,ex['name'])
            this.doAssert(desire,actualValue,ex['operation'],ex['name'])
        }
        
        return this.assertStatus
    }

    // 接口断言
    apiAssert = (resp, desireValue, assertType, operation) => {
        var assertResult = false
        var unsupportedTypeFlag = false

        // 用来记录当前断言类型的实际结果，写入道assertFail里面，比如当前是断言statusCode，预期200，实际404，actualValue的值为404
        var actualValue = "";
        switch(assertType) {
            case "statusCode" : {
                const actual = resp['statusCode']
                assertResult =  assert_.assertStatusCode(actual, desireValue)
                actualValue = actual
                break
            }
            case "duration": {
                const actual = resp['duration']
                assertResult =  assert_.assertDuration(actual, desireValue, operation)
                actualValue = actual
                break
            }
            default: {
                unsupportedTypeFlag = true
                break
            }
        }

        // 不支持的断言类型
        if (unsupportedTypeFlag) {
            this.assertFail[assertType] = {
                "desire": desireValue,
                "actualValue": null,
                "operation": operation,
                "reason": `assertType '${assertType}' not supported`
            }
        }

        // 根据单个字段断言结果，设置接口整体断言状态（成功/失败）
        if (assertResult) {
            if (this.assertStatus) {
                this.assertStatus = true
            }
        } else {
            this.assertStatus = false
            this.assertFail[assertType] = {
                "desire": desireValue,
                "actualValue": actualValue,
                "operation": operation,
                "reason": "match failed"
            }
        }
        
    }

    // 字段断言
    doAssert = (desire:string,actualValue:string,operation:string,key:string) => {
        var assertResult = false
        // todo： 加上解析response，拿到真实的值
        switch(operation) {
            case "include": {
                assertResult = assert_.assertInclude(desire, actualValue)
                break
            }
            case "equal": {
                assertResult = assert_.assertEqual(desire, actualValue)
                break
            }
            case "gt": {
                assertResult = assert_.assertGt(desire, actualValue)
                break
            }
            case "lt": {
                assertResult = assert_.assertLt(desire, actualValue)
                break
            }
            default: {
                assertResult = assert_.assertInclude(desire, actualValue)
                break
            }
        }

        // 设置断言状态，只有一个不通过，整个接口断言接口就失败
        if (assertResult) {
            if (this.assertStatus) {
                this.assertStatus = true
            }
        } else {
            this.assertStatus = false
            this.assertFail[key] = {
                "desire": desire,
                "actualValue": actualValue,
                "operation": operation,
                "reason": "match failed"
            }
            if (actualValue == undefined) {
                this.assertFail[key]['reason'] = "field not exist"
                this.assertFail[key]['actualValue'] = null
            }
        }
    }
}


// new Step(config, pre, after, expect, dependency,extract).executeCase().then(resp => {
//     console.log(JSON.stringify(resp))
// })

module.exports = {
    Step
}