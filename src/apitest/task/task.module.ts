import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PostgresService } from 'common/prisma/prisma.service';
import { ExecutorModule } from '../executor/executor.module';
import { ExecutorService } from '../executor/executor.service';
import { FeatMKModule } from '../featMK/featMK.module';
import { SceneModule } from '../scene/scene.module';
import { SceneService } from '../scene/scene.service';
import { TaskController } from './task.controller';
import { TaskRunResultService } from './task.report.service';
import { TaskService } from './task.service';
import { LoggerMiddleware } from 'middleware/logger.middleware';
import { DtoVerifyMiddleware } from 'middleware/dto_verify.middleware';

@Module({
    imports: [FeatMKModule,ExecutorModule,SceneModule],
    controllers: [TaskController],
    providers: [TaskService, PostgresService, ExecutorService, TaskRunResultService,SceneService],
    exports: [TaskService, TaskRunResultService]
  })
export class TaskModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(TaskController)
    // consumer.apply(DtoVerifyMiddleware).forRoutes(TaskController)

  }
  
}