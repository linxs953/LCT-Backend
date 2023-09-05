import { Module } from '@nestjs/common';
import { PostgresModule } from 'common/prisma/prisma.module';
import { PostgresService } from 'common/prisma/prisma.service';
import { SceneDataService } from '../scene/scene-data.service';
import { SceneModule } from '../scene/scene.module';
import { SceneService } from '../scene/scene.service';
import { ExecutorController } from './executor.controller';
import { ExecutorService } from './executor.service';

@Module({
    // imports: [SceneModule,PostgresModule],
    controllers: [],
    providers: [ExecutorService]
  })
  export class ExecutorModule {}