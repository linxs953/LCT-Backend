import { Prisma } from "@prisma/client"
import { IsNotEmpty, IsString } from "class-validator"


export interface CreateStepDto  {
    caseName: string
    stepName: string
    preFn: string
    isSkip: number
    moduleId: string
    afterFn: string
    expect: string
    apiConfig: string
    apiMethod: string
    apiUrl: string
    apiParam: string
    apiData: string
    apiHeaders: string
    extractSpec: string
    modifyPerson: string
    createPerson: string
    createTime: Date
    modifyTime: Date
}

export interface updateCaseInfoDto {
    condition: Prisma.at_case_infoWhereUniqueInput
    data: {
        caseName: string
        stepName: string
        preFn: string
        isSkip: number
        moduleId: string
        afterFn: string
        expect: string
        apiConfig: string
        apiMethod: string
        apiUrl: string
        apiParam: string
        apiData: string
        apiHeaders: string
        extractSpec: string
        modifyPerson: string
        createPerson: string
        createTime: Date
        modifyTime: Date
    }
}


export interface DeleteCaseInfoDto {
    condition: Prisma.at_case_infoWhereUniqueInput
}



export class CreateCaseDto {

    @IsNotEmpty()
    @IsString()
    caseName: string

    @IsNotEmpty()
    @IsString()
    stepName: string

    @IsNotEmpty()
    @IsString()
    preFn: string

    @IsNotEmpty()
    @IsString()
    isSkip: number

    @IsNotEmpty()
    @IsString()
    moduleId: string

    @IsNotEmpty()
    @IsString()
    afterFn: string

    @IsNotEmpty()
    @IsString()
    expect: string

    @IsNotEmpty()
    @IsString()
    apiConfig: string

    @IsNotEmpty()
    @IsString()
    apiMethod: string

    @IsNotEmpty()
    @IsString()
    apiUrl: string

    @IsNotEmpty()
    @IsString()
    apiParam: string
    
    @IsNotEmpty()
    @IsString()
    apiData: string

    @IsNotEmpty()
    @IsString()
    apiHeaders: string

    @IsNotEmpty()
    @IsString()
    extractSpec: string
}

export class UpdateCaseDto {

    @IsNotEmpty()
    @IsString()
    caseId: string

    
    @IsNotEmpty()
    @IsString()
    caseName?: string

    @IsNotEmpty()
    @IsString()
    stepName?: string

    @IsNotEmpty()
    @IsString()
    preFn?: string

    @IsNotEmpty()
    @IsString()
    isSkip?: number

    @IsNotEmpty()
    @IsString()
    moduleId?: string

    @IsNotEmpty()
    @IsString()
    afterFn?: string

    @IsNotEmpty()
    @IsString()
    expect?: string

    @IsNotEmpty()
    @IsString()
    apiConfig?: string

    @IsNotEmpty()
    @IsString()
    apiMethod?: string

    @IsNotEmpty()
    @IsString()
    apiUrl?: string

    @IsNotEmpty()
    @IsString()
    apiParam?: string
    
    @IsNotEmpty()
    @IsString()
    apiData?: string

    @IsNotEmpty()
    @IsString()
    apiHeaders?: string

    @IsNotEmpty()
    @IsString()
    extractSpec?: string
    
    
}

export class DeleteCaseParamDto {
    
    @IsNotEmpty()
    @IsString()
    caseId: string
}

export class FetchCaseParamDto {

    @IsNotEmpty()
    @IsString()
    caseId: string
}


export class FetchCaseInModuleParamDto {
    moduleId: string
}