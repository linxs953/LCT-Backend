import { Module } from "@nestjs/common";
import { SceneDataService } from "./sceneData.service";
import { SceneDataController } from "./sceneData.controller";
import { PostgresModule } from "src/feature/common/prisma/prisma.module";

@Module({
    imports: [PostgresModule],
    controllers: [SceneDataController],
    providers: [SceneDataService]
  })
  export class SceneDataModule {}