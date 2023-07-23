
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