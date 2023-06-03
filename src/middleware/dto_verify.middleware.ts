import { HttpStatus, Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';
import ROUTE_CONFIG from "src/config/interface";
import { verifyQuery,verifyBody } from "src/utils/middleware/middleware";

@Injectable()
export class DtoVerifyMiddleware implements NestMiddleware {
    private readonly dtoVerifyLogger:Logger
    constructor() {
        this.dtoVerifyLogger = new Logger(DtoVerifyMiddleware.name)
    }
    use(req: Request, res: Response, next: NextFunction) {
        const path = req.path
        switch (path) {
            case "/apitest/taskService/getResult": {
                // 验证url参数
                let error = verifyQuery(req,ROUTE_CONFIG[path]['query'])
                if (error) {
                    this.dtoVerifyLogger.error(error.stack, "")
                    const _ = {
                        success: false,
                        message: error.message,
                        data: null
                    }
                    res.status(400).send(_)
                    return
                }

                // 验证body参数
                error = verifyBody(req, ROUTE_CONFIG[path]['body'])
                if (error) {
                    this.dtoVerifyLogger.error(error.stack, "")
                    const _ = {
                        "success": false,
                        "message": error.message,
                        "data": null
                    }
                    res.status(HttpStatus.BAD_REQUEST).send(_)
                }
                break
            }
            case "/apitest/taskService/start": {
                 // 验证url参数
                 let error = verifyQuery(req,ROUTE_CONFIG[path]['query'])
                 if (error) {
                     this.dtoVerifyLogger.error(error.stack, "")
                     const _ = {
                         success: false,
                         message: error.message,
                         data: null
                     }
                     res.status(400).send(_)
                     return
                 }
 
                 // 验证body参数
                 error = verifyBody(req, ROUTE_CONFIG[path]['body'])
                 if (error) {
                     this.dtoVerifyLogger.error(error.stack, "")
                     const _ = {
                         "success": false,
                         "message": error.message,
                         "data": null
                     }
                     res.status(HttpStatus.BAD_REQUEST).send(_)
                 }
                 break
            }
            case "/apitest/taskService/getAllScene": {
                // 验证url参数
                let error = verifyQuery(req,ROUTE_CONFIG[path]['query'])
                if (error) {
                    this.dtoVerifyLogger.error(error.stack, "")
                    const _ = {
                        success: false,
                        message: error.message,
                        data: null
                    }
                    res.status(400).send(_)
                    return
                }

                // 验证body参数
                error = verifyBody(req, ROUTE_CONFIG[path]['body'])
                if (error) {
                    this.dtoVerifyLogger.error(error.stack, "")
                    const _ = {
                        "success": false,
                        "message": error.message,
                        "data": null
                    }
                    res.status(HttpStatus.BAD_REQUEST).send(_)
                }
                break
            }
            case "/uitest/widgetService/getWidgets": {
                // 验证url参数
                let error = verifyQuery(req,ROUTE_CONFIG[path]['query'])
                if (error) {
                    this.dtoVerifyLogger.error(error.stack, "")
                    const _ = {
                        success: false,
                        message: error.message,
                        data: null
                    }
                    res.status(400).send(_)
                    return
                }

                // 验证body参数
                error = verifyBody(req, ROUTE_CONFIG[path]['body'])
                if (error) {
                    this.dtoVerifyLogger.error(error.stack, "")
                    const _ = {
                        "success": false,
                        "message": error.message,
                        "data": null
                    }
                    res.status(HttpStatus.BAD_REQUEST).send(_)
                }
                break
            }
            case "/uitest/widgetService/getAllWidgets": {
                // 验证url参数
                let error = verifyQuery(req,ROUTE_CONFIG[path]['query'])
                if (error) {
                    this.dtoVerifyLogger.error(error.stack, "")
                    const _ = {
                        success: false,
                        message: error.message,
                        data: null
                    }
                    res.status(400).send(_)
                    return
                }

                // 验证body参数
                error = verifyBody(req, ROUTE_CONFIG[path]['body'])
                if (error) {
                    this.dtoVerifyLogger.error(error.stack, "")
                    const _ = {
                        "success": false,
                        "message": error.message,
                        "data": null
                    }
                    res.status(HttpStatus.BAD_REQUEST).send(_)
                }
                break
            }
        }
        next()
    }
    
}