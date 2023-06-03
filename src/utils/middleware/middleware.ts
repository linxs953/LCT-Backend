import { Request } from 'express';



export function verifyQuery(req: Request, paramsList:Array<String>) {
    const query = Object.keys(req.query)
    if (query.length == 0 && paramsList.length > 0) {
        return new Error(`not specified param ${paramsList}`)
    }
    for (let param=0;param< paramsList.length;param++) {
        let reqQueryList = Object(query)
        for (let key=0;key< reqQueryList.length;key++) {
            if (reqQueryList[key] != paramsList[param] && (query.indexOf(reqQueryList[key]) == reqQueryList.length - 1)) {
                return new Error(`param [${paramsList[param]}] not specified`)
            }
            if (reqQueryList[key] == param) {
                break
            }
            continue
        }
    }
    return null
}


export function verifyBody(req:Request, bodyList: Array<String>) {
    return null
}