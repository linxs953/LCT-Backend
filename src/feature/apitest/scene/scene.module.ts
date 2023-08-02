import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PostgresModule } from 'src/common/prisma/prisma.module';
import { PostgresService } from 'src/common/prisma/prisma.service';
import { StepModule } from '../step/step.module';
import { StepService } from '../step/step.service';
import { CaseReferService } from './scene-case-relation.service';
import { SceneDataService } from './scene-data.service';
import { SceneController } from './scene.controller';
import { SceneService } from './scene.service';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';

@Module({
    imports: [PostgresModule, StepModule],
    controllers: [SceneController],
    providers: [SceneService, CaseReferService,PostgresService,StepService,SceneDataService],
    exports: [SceneService,StepService,CaseReferService,SceneDataService]
  })
  export class SceneModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleware).forRoutes(SceneController)
  
    }
    
  }