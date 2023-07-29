import { Module } from '@nestjs/common';
import { PostgresModule } from 'src/common/prisma/prisma.module';
import { PostgresService } from 'src/common/prisma/prisma.service';
import { ExecutorModule } from './executor/executor.module';
import { ExecutorService } from './executor/executor.service';
import { FeatMKController } from './featMK/featMK.controller';
import { FeatMKModule } from './featMK/featMK.module';
import { FeatMKService } from './featMK/featMK.service';
import { SceneModule } from './scene/scene.module';
import { SceneService } from './scene/scene.service';
import { StepController } from './step/step.controller';
import { StepModule } from './step/step.module';
import { StepService } from './step/step.service';
import { TaskController } from './task/task.controller';
import { TaskModule } from './task/task.module';
import { TaskService } from './task/task.service';


@Module({
  imports: [TaskModule, StepModule, FeatMKModule, ExecutorModule, PostgresModule,SceneModule],
  providers: [TaskService, StepService, FeatMKService, ExecutorService, PostgresService, SceneService]
})
export class ApiTestModule {}
