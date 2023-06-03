import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiTestModule } from './feature/apitest/apitest.module';
import { UITestModule } from './feature/uitest/uitest.module';

@Module({
  imports: [ApiTestModule,UITestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
