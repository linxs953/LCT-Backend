import { Request } from 'express';



export function verifyQuery(req: Request, paramsList:Array<string>) {
    const query = Object.keys(req.query)

    // 如果参数列表长度不一致
    // if(query.length != paramsList.length) {
    //     // 缺少参数
    //     if (query.length < paramsList.length) {
    //         return new Error(`must contain [${paramsList}] but only specified [${query}]`)
    //     }
    // }

    let reqQueryList = Object(query)
    const reqQueryListStr = JSON.stringify(reqQueryList)

    // 验证预期参数有没有在请求参数中找到
    for (let param=0;param< paramsList.length;param++) {
        if (!reqQueryListStr.includes(paramsList[param])) {
            return new Error(`param [${paramsList[param]}] not specified`)
        }
    }
    return null
}


export function verifyBody(req:Request, bodyList: Array<String>) {
    return null
}