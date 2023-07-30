import { Prisma } from "@prisma/client";

/*
    scene.service 通用返回结构
*/

export interface SceneServiceVO {
    error: Error
    data: Prisma.at_scene_infoCreateInput | Prisma.at_scene_case_relationCreateInput | Prisma.at_scene_dataCreateInput | {}
}

export interface SceneServiceDataListVO {
    error: Error
    data: Array<Prisma.at_scene_infoCreateInput | Prisma.at_scene_case_relationCreateInput | Prisma.at_scene_dataCreateInput | {}>
}