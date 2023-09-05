
class Step {
    apiConfig:{}
    preFn:String
    afterFn:String
    expect:{}
    dependency:{}
    extractSpec:Array<any>
    caseName:String
}
// 执行器输入参数
export class CollectionRunDto {
    "name": string
    "data": Array<Step>
}


export class CollectionRunResultVO {
    status: number
    message: string
    data: {}
    error?: {}
}