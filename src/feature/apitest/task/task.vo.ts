// 创建任务的返回值结构
 export interface CreateTaskVO {
    status: number
    isSuccess: boolean
    message?: string
    errMsg?: string
    data: {
        task_id: string
    }
}

// 更新任务的返回值结构
export interface UpdateTaskVO {
    status: number
    isSuccess: boolean
    message?: string
    errMsg?: string
}

// 删除任务的返回值结构
export interface DeleteTaskVO  {
    status: number
    isSuccess: boolean
    message?: string
    errMsg?: string
}


// 任务运行接口的返回值结构
export interface StartTaskVO {
    status: number
    isSuccess:boolean
    logId?: string
    errMsg?: string
    message?: string
    
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
export interface ApiRunVO {
    success: boolean
    message: string
    data: {
        taskRunList: Array<TaskRunSceneDetail>
        taskRunSceneList: Array<TaskRunSceneInfo>
        taskRunInfo: TaskRunInfo
    }
}