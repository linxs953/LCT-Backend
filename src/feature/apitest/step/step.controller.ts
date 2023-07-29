import { Controller  } from "@nestjs/common";
import { APITEST_CONFIG } from "../apitest.config";
import {StepService } from "./step.service";
import {Logger} from "@nestjs/common"

@Controller(`${APITEST_CONFIG.routePrefix}/stepService`)
export class StepController {
    private stepLogger:Logger
    constructor (
        private readonly stepService:StepService,
    ) {
        this.stepLogger = new Logger(StepController.name)
    }
    
}