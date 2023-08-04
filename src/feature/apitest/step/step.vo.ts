import { Prisma } from "@prisma/client"
import { BaseControllerVO } from "src/config/baseControllerVO"

export interface CaseVO {
    case_no: number,
    case_id: string,
    case_name: string,
    is_skip: number,
    module_id: string,
    pre_fn: string,
    after_fn: string,
    api_method: string,
    api_param: string,
    api_url: string,
    api_data: string,
    api_headers: string,
    extract_spec: string,
    expect: string,
    api_config: string,
}


export interface StepServiceVO {
    error: Error
    data: Prisma.at_case_infoCreateInput | CaseVO | {}
}

export interface StepServiceListVO {
    error: Error
    data: Array<Prisma.at_case_infoCreateInput | CaseVO | {}>
}


/*
    case service controller
*/


export interface CreateCaseVO extends BaseControllerVO {
    data: Prisma.at_case_infoCreateInput
}

export interface UpdateCaseVO extends BaseControllerVO {
    data: Prisma.at_case_infoCreateInput
}

export interface DeleteCaseVO extends BaseControllerVO {
    
}

export interface FindCaseVO extends BaseControllerVO {
    data: Prisma.at_case_infoCreateInput
}

export interface FindCaseListVO extends BaseControllerVO {
    data: Array<Prisma.at_case_infoCreateInput>
}