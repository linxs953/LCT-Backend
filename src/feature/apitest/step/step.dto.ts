import { Prisma } from "@prisma/client"


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