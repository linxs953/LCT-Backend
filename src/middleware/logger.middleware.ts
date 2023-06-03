import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';



@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly taskMiddlewareLogger:Logger
    constructor() {
        this.taskMiddlewareLogger = new Logger(LoggerMiddleware.name)
    }
    use(req: Request, res: Response, next: NextFunction) {
        this.taskMiddlewareLogger.debug(`/${req.method} ${req.url}`)
        const start =  Date.now()
        // 统计请求耗时
        res.on('finish', () => {
            const duration = Date.now() - start
            this.taskMiddlewareLogger.debug(`${req.url} cost ${duration}ms`)
        })
        next()
    }
    
}