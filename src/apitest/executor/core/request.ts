import axios from "axios"
import { Logger } from "@nestjs/common"
class AxiosRequest {
    public reqConfig: any
    public runResult: any
    private requestLogger:Logger
    constructor(config) {
        this.reqConfig = config
        this.runResult = {}
        this.requestLogger = new Logger(AxiosRequest.name)
    }

    /*请求返回结构
        {
            result: {
                "statusCode":200,
                "isSuccess":true,
                "duration":1631,
                "response": {},
                "error": null
            }
            config: {
                "method":"post",
                "url":"https://httpbin.org/post",
                "param":{},
                "data":{},
                "timeout":5000,
                "retryTimes":5,
                "headers":{
                    "Content-Type":"application/json"
                }
            }
        }
    */
    private get2 = async (config) =>  {
        var runResult = {
            result: {},
            config: this.reqConfig
        }
        return new Promise((resolve,rejects) => {
            axios.get(config.url, {
                params: config.param,
                headers: config.headers,
                timeout: config.timeout,
                method: config.method  
            }).then(resp => {
                runResult['result']['response'] = resp.data
                runResult['result']['statusCode'] = resp.status
                if (runResult['result']['statusCode'] == 200) {
                    runResult['result']['isSuccess'] = true 
                } else {
                    runResult['result']['isSuccess'] = false
                }
                resolve(runResult)
            }).catch(err => {
                if (err.response) {
                    // 有响应，状态码不对
                    runResult['result']['isSuccess'] = false
                    runResult['result']['statusCode'] = err.response.status
                    runResult['result']['error'] = err.message
                } else if (err.request) {
                    // 没有获取响应
                    runResult['result']['isSuccess'] = false
                    runResult['result']['error'] = err.message
                    runResult['result']['statusCode'] = -1
                } else {
                    // 发送请求失败
                    runResult['result']['error'] = err.message
                    runResult['result']['isSuccess'] = false
                    runResult['result']['statusCode'] = -1
                }
                this.requestLogger.error(`request occur error.\n${JSON.stringify(runResult)}`)
                rejects(runResult)
            })
        })
    }

    private post2 = async (config) => {
        var runResult = {
            config: this.reqConfig,
            result: {}
        }
        return new Promise((resolve,reject)=>{
            axios.post(config.url, config.data, {
                method: config.method,
                headers: config.headers,
                timeout: config.timeout,
                params: config.param
            }).then(resp => {
                runResult['result']['response'] = resp.data
                runResult['result']['statusCode'] = resp.status
                if (runResult['result']['statusCode'] == 200) {
                    runResult['result']['isSuccess'] = true 
                } else {
                    runResult['result']['isSuccess'] = false
                }
                resolve(runResult)
            }).catch(err => {
                this.requestLogger.debug(`axios post failed. ${JSON.stringify(err.message)}`)
                if (err.response) {
                    // 有响应，状态码不对
                    runResult['result']['isSuccess'] = false
                    runResult['result']['statusCode'] = err.response.status
                    runResult['result']['error'] = err.message
                } else if (err.request) {
                    // 没有获取响应
                    runResult['result']['isSuccess'] = false
                    runResult['result']['error'] = err.message
                    runResult['result']['statusCode'] = -1
                } else {
                    // 发送请求失败
                    runResult['result']['error'] = err.message
                    runResult['result']['isSuccess'] = false
                    runResult['result']['statusCode'] = -1
                }
                this.requestLogger.error(`request occur error.\n${JSON.stringify(runResult)}`,"")
                reject(runResult)
            })
        })
    }
    
    /*请求重试后返回结构
        {
            caseResult: {
                "statusCode":200,
                "isSuccess":true,
                "canRetryTimes":5,
                "hasRetryTimes":0,
                "duration":1631,
                "response": {},
                "error": null
            }
            caseConfig: {
                "method":"post",
                "url":"https://httpbin.org/post",
                "param":{},
                "data":{},
                "timeout":5000,
                "retryTimes":5,
                "headers":{
                    "Content-Type":"application/json"
                }
            }
        }
    */
    async sendRequest() {
        switch(String(this.reqConfig['method']).toUpperCase()) {
            case "POST": return this.doAndRetry(this.post2)
            case "GET": return this.doAndRetry(this.get2)
        }
    }

    // 进行重试处理
    doAndRetry = async (sendRequestFn) => {
        var retryTimes = this.reqConfig['retryTimes']
        for (let i = retryTimes;i>=0;i--) {
            try {
                // 每次执行前清空
                this.runResult = {}
                const startTime = new Date().getTime()
                const resp = await sendRequestFn(this.reqConfig)
                if (!resp.err) {
                    this.runResult['caseResult'] = resp['result']
                    this.runResult['caseConfig'] = resp['config']
                    this.runResult['caseResult']['canRetryTimes'] = this.reqConfig['retryTimes']
                    this.runResult['caseResult']['hasRetryTimes'] = this.reqConfig['retryTimes'] - i
                    this.runResult['caseResult']['duration'] = new Date().getTime() - startTime
                    break
                } 
            }catch(err) {
                var oldResult = this.runResult['caseResult']
                if (oldResult) {
                    // 如果有执行结果，拿到结果的response
                    oldResult = oldResult['response']
                }
                this.runResult['caseResult'] = {
                    "response": oldResult,
                    "isSuccess": false,
                    "error": err,
                }
                this.runResult['caseConfig'] = this.reqConfig
            }
            retryTimes = retryTimes - 1

            // 没有重试次数
            if (retryTimes == 0) {
                this.runResult['caseResult']['hasRetryTimes'] = this.reqConfig['retryTimes']
            } 
            
            // 还能重试，输出日志
            if (i > 0) {
                this.requestLogger.debug(`retry request, leave times ${i}`)
            }
            
        }
        return this.runResult
        
    }

}

const config = {
    "method": "post",
    "url": "",
    "param": {},
    "data": {},
    "timeout": 5000,
    "retryTimes": 5,
    "headers": {
        "Content-Type": "application/json"
    }
}

// new AxiosRequest(config).sendRequest().then(rs => {
//     console.log(rs)
// })
export default AxiosRequest



