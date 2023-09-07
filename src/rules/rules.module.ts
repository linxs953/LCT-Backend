import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { RuleController } from "./rules.controller";
import { LoggerMiddleware } from "middleware/logger.middleware";
import { RulesService } from "./rules.service";



@Module({
    imports: [],
    controllers: [RuleController],
    providers: [RulesService],
    exports: [RulesService]
  })
export class RulesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(RuleController)
    // consumer.apply(DtoVerifyMiddleware).forRoutes(TaskController)
  }
}