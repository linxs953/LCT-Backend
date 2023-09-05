import { Prisma } from "@prisma/client"

interface CommonFields {
    status: number
    isSuccess: boolean
    message?: string
    errMsg?: string
}


// 创建任务的返回值结构
 export interface CreateTaskVO extends CommonFields {
    data: {
        task_id: string
    }
}

// 更新任务的返回值结构
export interface UpdateTaskVO extends CommonFields {
}

// 删除任务的返回值结构
export interface DeleteTaskVO extends CommonFields  {
}


export interface CreateTaskRelationVO extends CommonFields {
    data?: {
        taskType: string
    }
}

//更新task relation的返回值结构
export interface UpdateTaskRelationVO extends CommonFields {}

export interface TaskRelationRecord {
    taskId:string,
    moduleId?: string
    moduleName?: string
    sceneName?: string
    sceneId?: string
    taskType: string
}

// 获取taskRelation的返回值结构
export interface FindTaskRelationVO extends CommonFields {
    data: Array<TaskRelationRecord>
}

// 获取任务配置的场景的返回值结构
export interface FindAllSceneOfTaskVO extends CommonFields {
    data: {}
}

// 任务运行接口的返回值结构
export interface StartTaskVO extends CommonFields {
    logId?: string
}

interface TaskRunSceneDetail {
    sceneName: string
    stepName: string
    runStatus: boolean
    stage: string
    error: string|{}
    result: {}
}

interface TaskRunSceneInfo {
    sceneName: string
    execSuccessNum: number
    execFailNum: number
    sceneTotalNum: number
    runStatus: boolean
}

interface TaskRunInfo {
    taskId: string
    taskRunId: string
    taskStatus: number
    taskRunName: string
    totalNum: number
    successNum: number
    failedNum: number
    executedNum: number
    createTime: string | Date
}

// 获取任务执行结果接口的返回值结构
export interface ApiRunVO extends CommonFields{
    data: {
        taskRunList: Array<TaskRunSceneDetail>
        taskRunSceneList: Array<TaskRunSceneInfo>
        taskRunInfo: TaskRunInfo
    }
}



/*
    service 通用返回对象    
*/


// task.service通用返回对象
export interface TaskServiceVO {
    error: Error
    data?: Prisma.at_task_infoCreateInput | Prisma.at_task_model_relationCreateInput | Prisma.at_task_run_logCreateInput | {}
}

// task.service查询多条数据的通用返回对象
export interface TaskServiceDataListVO {
    error: Error
    data: Array<Prisma.at_task_infoCreateInput | Prisma.at_task_model_relationCreateInput | Prisma.at_task_run_logCreateInput>
}
