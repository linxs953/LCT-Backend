import { Module } from '@nestjs/common';
import { PostgresModule } from 'src/feature/common/prisma/prisma.module';
import { PostgresService } from 'src/feature/common/prisma/prisma.service';
import { SceneModule } from '../scene/scene.module';
import { SceneService } from '../scene/scene.service';
import { FeatMKController } from './featMK.controller';
import { FeatMKService } from './featMK.service';


@Module({
  imports: [PostgresModule, SceneModule],
    controllers: [],
    providers: [FeatMKService, PostgresService, SceneService],
    exports: [FeatMKService]
  })
  export class FeatMKModule {}