import { HttpStatus, Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';
import ROUTE_CONFIG from "src/config/interface";
// import { verifyQuery,verifyBody } from "src/utils/middleware/middleware";
import { verifyQuery,verifyBody } from "src/middleware/middleware.util";


@Injectable()
export class DtoVerifyMiddleware implements NestMiddleware {
    private readonly dtoVerifyLogger:Logger
    constructor() {
        this.dtoVerifyLogger = new Logger(DtoVerifyMiddleware.name)
    }

    verify(request:Request, queryList:Array<string>) {
        // 验证url参数
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
                    this.dtoVerifyLogger.error(`param [${q}] value null`, "")
                    return {
                        success: false,
                        message: `param [${q}] value null`,
                        data: null
                    }
                }
            }
        }

        // 验证body参数
        error = verifyBody(request, queryList)
        if (error) {
            this.dtoVerifyLogger.error(error.stack, "")
            return {
                "success": false,
                "message": error.message,
                "data": null
            }
        }
        return
    }

    use(req: Request, res: Response, next: NextFunction) {
        
        switch (req.path) {
            case "/apitest/taskService/getResult": {
                const error = this.verify(req,ROUTE_CONFIG[req.path]['query'])
                if (error) {
                    res.status(HttpStatus.BAD_REQUEST).send(error)
                    return
                }
                break
            }
            case "/apitest/taskService/start": {
                 const error = this.verify(req,ROUTE_CONFIG[req.path]['query'])
                 if (error) {
                     res.status(HttpStatus.BAD_REQUEST).send(error)
                     return
                 }
                 break
            }
            case "/apitest/taskService/getAllScene": {
                const error = this.verify(req,ROUTE_CONFIG[req.path]['query'])
                if (error) {
                    res.status(HttpStatus.BAD_REQUEST).send(error)
                    return
                }
                break
            }
            case "/uitest/widgetService/getWidgets": {
                const error = this.verify(req,ROUTE_CONFIG[req.path]['query'])
                if (error) {
                    res.status(HttpStatus.BAD_REQUEST).send(error)
                    return
                }
                break
            }
            case "/uitest/widgetService/getAllWidgets": {

                const error = this.verify(req,ROUTE_CONFIG[req.path]['query'])
                if (error) {
                    res.status(HttpStatus.BAD_REQUEST).send(error)
                    return
                }
                break
            }
        }
        next()
    }
    
}