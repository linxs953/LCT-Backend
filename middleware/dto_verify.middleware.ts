import { HttpStatus, Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';
import ROUTE_CONFIG from "config/interface";
// import { verifyQuery,verifyBody } from "src/utils/middleware/middleware";
import { verifyQuery,verifyBody } from "middleware/middleware.util";


@Injectable()
export class DtoVerifyMiddleware implements NestMiddleware {
    private readonly dtoVerifyLogger:Logger
    constructor() {
        this.dtoVerifyLogger = new Logger(DtoVerifyMiddleware.name)
    }

    verify(request:Request, routeConfig:{}) {
        // 验证url参数
        const queryList = routeConfig['query']
        const bodyList = routeConfig['body']

        let error = verifyQuery(request,queryList)
        if (error) {
            this.dtoVerifyLogger.error(error.stack, "")
            return {
                success: false,
                message: error.message,
                data: null
            }
        } else {
            const queryMap = request.query
            for (let q of Object(queryList)) {
                if (queryMap[q] === "") {
                    this.dtoVerifyLogger.error(`param [${q}] value null`,"")
                    return {
                        success: false,
                        message: `param [${q}] value null`,
                        data: null
                    }
                }
            }
        }

        // 验证body参数
        error = verifyBody(request, bodyList)
        if (error) {
            this.dtoVerifyLogger.error(error.stack, "")
            return {
                "success": false,
                "message": error.message,
                "data": null
            }
        } else {
            const bodyMap = request.body
            for (let q of Object(bodyList)) {
                if (bodyMap[q] === "") {
                    this.dtoVerifyLogger.error(`body param [${q}] value null`, "")
                    return {
                        success: false,
                        message: `body param [${q}] value null`,
                        data: null
                    }
                }
            }
        }
        return
    }

    use(req: Request, res: Response, next: NextFunction) {
        const queryVerifyErr = this.verify(req,ROUTE_CONFIG[req.path])
        if (queryVerifyErr) {
            res.status(HttpStatus.BAD_REQUEST).send(queryVerifyErr)
            return
        }
        next()
    }
    
}