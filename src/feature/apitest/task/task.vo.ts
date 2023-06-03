

export class StartTaskVO {
    status: number
    isSuccess:boolean
    logId?: string
    errMsg?: string
    message?: string
    
}


class TaskRunSceneDetail {
    sceneName: string
    stepName: string
    runStatus: boolean
    stage: string
    error: string|{}
    result: {}
}

class TaskRunSceneInfo {
    sceneName: string
    execSuccessNum: number
    execFailNum: number
    sceneTotalNum: number
    runStatus: boolean
}

class TaskRunInfo {
    taskRunId: string
    taskStatus: number
    taskRunName: string
    totalNum: number
    successNum: number
    failedNum: number
    executedNum: number
    createTime: string | Date
}

export class ApiRunVO {
    success: boolean
    message: string
    data: {
        taskRunList: Array<TaskRunSceneDetail>
        taskRunSceneList: Array<TaskRunSceneInfo>
        taskRunInfo: TaskRunInfo
    }
}