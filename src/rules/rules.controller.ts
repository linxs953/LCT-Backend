import { Controller } from "@nestjs/common";
import { RULES_CONFIG } from "./rules.config";




@Controller(`${RULES_CONFIG.routePrefix}/taskService`)
export class RuleController {
    
}