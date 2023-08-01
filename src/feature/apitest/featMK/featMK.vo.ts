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



/*
    controller 返回结构
*/

class CommonFields {
    status: number
    message: string
    isSuccess: boolean    
}


export class CreateModudleVO extends CommonFields {
    data: {
        moduleId: string
        moduleName: string
        createTime: Date | string
        createUser: string
    }
}


export class UpdateModuleVO extends CommonFields {
    data: {
        moduleId: string
        moduleName: string
        createTime: Date | string
        createUser: string
    }
}


export class DeleteModuleVO extends CommonFields {}


export class FindModuleInfoVO extends CommonFields {
    data: {
        moduleId: string
        moduleName: string
        createTime: Date | string
        createUser: string
    }
}

export class FindModuleListVO extends CommonFields {
    data: Array<Prisma.at_module_infoCreateInput | Prisma.at_task_model_relationCreateInput>
}