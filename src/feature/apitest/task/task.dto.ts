import { Prisma } from "@prisma/client"

// 创建任务的body参数
export interface TaskInfoDto {
    task_name: string
    run_env: string
    is_enable: number
    auto_run_enable: number
}


export interface UpdateTaskDto {
    condition: {
        task_id: string
    }
    data: {
        task_name: string
        run_env: string
        is_enable: number
        auto_run_enable: number
    }
}


// 创建关联任务的参数
export interface TaskRelationDto {
    taskId:string
    taskType: string
    moduleIdList?: Array<string>
    sceneIdList?: Array<string>
}

// 更新关联任务的参数
export interface TaskRelationUpdataDto {
    relationId: string
    taskId: string
    taskType: string
    moduleIdList?: Array<string>
    sceneIdList?: Array<string>
}

// 创建任务运行记录的参数
export interface TaskRunRecordCreateDto {
    relation: Prisma.at_task_model_relationCreateInput
    taskName: string
    logId: string
    allCaseNum: number
    execFinishedNum: number
    execSuccessNum: number
    exec_FailedNum: number
}

export interface TaskRunRecordUpdateDto {
    runId: string
    runResult: Object
    scenName: string
    finishedCount: number
    successCount: number
    failedCount: number
}