import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PostgresModule } from 'common/prisma/prisma.module';
import { PostgresService } from 'common/prisma/prisma.service';
import { SceneModule } from '../scene/scene.module';
import { SceneService } from '../scene/scene.service';
import { FeatMKController } from './featMK.controller';
import { FeatMKService } from './featMK.service';
import { LoggerMiddleware } from 'middleware/logger.middleware';
import { DtoVerifyMiddleware } from 'middleware/dto_verify.middleware';


@Module({
  imports: [PostgresModule, SceneModule],
    controllers: [FeatMKController],
    providers: [FeatMKService, PostgresService, SceneService],
    exports: [FeatMKService]
  })
  // export class FeatMKModule {}
  export class FeatMKModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleware).forRoutes(FeatMKController)
      // consumer.apply(DtoVerifyMiddleware).forRoutes(FeatMKController)
  
    }
  }