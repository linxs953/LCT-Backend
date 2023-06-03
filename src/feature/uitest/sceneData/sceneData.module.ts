import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { SceneDataService } from "./sceneData.service";
import { SceneDataController } from "./sceneData.controller";
import { PostgresModule } from "src/feature/common/prisma/prisma.module";
import { LoggerMiddleware } from "src/middleware/logger.middleware";
import { DtoVerifyMiddleware } from "src/middleware/dto_verify.middleware";

@Module({
    imports: [PostgresModule],
    controllers: [SceneDataController],
    providers: [SceneDataService]
  })
  export class SceneDataModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleware).forRoutes(SceneDataController)
      consumer.apply(DtoVerifyMiddleware).forRoutes(SceneDataController)
  
    }
  }