import { Module } from '@nestjs/common';
import { PostgresModule } from 'src/feature/common/prisma/prisma.module';
import { PostgresService } from 'src/feature/common/prisma/prisma.service';
import { StepModule } from '../step/step.module';
import { StepService } from '../step/step.service';
import { CaseReferService } from './scene-case-relation.service';
import { SceneDataService } from './scene-data.service';
import { SceneController } from './scene.controller';
import { SceneService } from './scene.service';

@Module({
    imports: [PostgresModule, StepModule],
    controllers: [],
    providers: [SceneService, CaseReferService,PostgresService,StepService,SceneDataService],
    exports: [SceneService,StepService,CaseReferService,SceneDataService]
  })
  export class SceneModule {}