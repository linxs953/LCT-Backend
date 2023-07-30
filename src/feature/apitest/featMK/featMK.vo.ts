import { Prisma } from "@prisma/client";

/*
    featMk.service 返回结构
*/
export interface FeatMKServiceVO {
    data: Prisma.at_module_infoCreateInput | Prisma.at_task_model_relationCreateInput  | {}
    error: Error
}

export interface FeatMkServiceDataListVO {
    data: Array<Prisma.at_module_infoCreateInput | Prisma.at_task_model_relationCreateInput>
    error: Error
}