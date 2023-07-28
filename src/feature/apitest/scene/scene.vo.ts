import { Prisma } from "@prisma/client";

export interface FindSceneRecordVO {
    data: Prisma.at_scene_infoCreateInput
    error: Error
}

export interface FindSceneRecordsVO {
    data: Array<Prisma.at_scene_infoCreateInput>
    error: Error
}

export interface FindSceneAllCaseVO {
    data: {}
    error: Error
}


export interface FindSceneDataRecordVO {
    data: Array<Prisma.at_scene_dataCreateInput>,
    error: Error
}