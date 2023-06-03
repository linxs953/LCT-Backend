import { Module } from '@nestjs/common';
import { PostgresModule } from 'src/feature/common/prisma/prisma.module';
import { PostgresService } from 'src/feature/common/prisma/prisma.service';
import { UIWidgetModule } from './widget/widget.module';
import { UIWidgetService } from './widget/widget.service';
import { SceneDataModule } from './sceneData/sceneData.module';
import { SceneDataService } from './sceneData/sceneData.service';


@Module({
  imports: [PostgresModule,UIWidgetModule,SceneDataModule],
  providers: [PostgresService,UIWidgetService,SceneDataService]
})
export class UITestModule {}
