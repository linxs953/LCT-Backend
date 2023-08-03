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


/*
    scene.controller 通用返回结构
*/
class CommonFields {
    status: number
    isSuccess: boolean
    message: string
}

export class FindSceneInfoVO extends CommonFields {
    data: Prisma.at_scene_infoCreateInput
}

export class FindSceneInfoListVO extends CommonFields {
    data: Array<Prisma.at_scene_infoCreateInput>
}

export class CreateSceneInfoVO extends CommonFields {
    data: Prisma.at_scene_infoCreateInput
}

export class UpdateSceneInfoVO extends CommonFields {
    data: Prisma.at_scene_infoCreateInput
}

export class DeleteSceneInfoVO extends CommonFields {
    
}


export class FindSceneRelationVO extends CommonFields {
    data: Prisma.at_scene_case_relationCreateInput
}

export class DeleteSceneRelationVO extends CommonFields {}


export class CreateSceneRelationVO extends CommonFields {
    data: Prisma.at_scene_case_relationCreateInput
}





