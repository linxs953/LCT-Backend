
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PostgresModule } from 'src/feature/common/prisma/prisma.module';
import { UIWidgetController } from './widget.controller';
import { UIWidgetService } from './widget.service';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';
import { DtoVerifyMiddleware } from 'src/middleware/dto_verify.middleware';

@Module({
    imports: [PostgresModule],
    controllers: [UIWidgetController],
    providers: [UIWidgetService]
  })
  export class UIWidgetModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleware).forRoutes(UIWidgetController)
      consumer.apply(DtoVerifyMiddleware).forRoutes(UIWidgetController)
  
    }
  }