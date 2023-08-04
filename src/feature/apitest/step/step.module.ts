import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PostgresService } from 'src/common/prisma/prisma.service';
import { StepController } from './step.controller';
import { StepService } from './step.service';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';

@Module({
    controllers: [StepController],
    providers: [StepService, PostgresService],
    exports: [StepService]
  })
  export class StepModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleware).forRoutes(StepController)
      // consumer.apply(DtoVerifyMiddleware).forRoutes(TaskController)
  
    }
    
  }