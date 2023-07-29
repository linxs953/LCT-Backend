import { Module } from '@nestjs/common';
import { PostgresService } from 'src/common/prisma/prisma.service';
import { StepController } from './step.controller';
import { StepService } from './step.service';

@Module({
    controllers: [],
    providers: [StepService, PostgresService],
    exports: [StepService]
  })
  export class StepModule {}