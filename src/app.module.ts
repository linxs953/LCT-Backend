import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiTestModule } from './apitest/apitest.module';
import { RulesModule } from './rules/rules.module';
import { RuleController } from './rules/rules.controller';

@Module({
  imports: [ApiTestModule, RulesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
