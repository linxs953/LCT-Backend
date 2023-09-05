import {  Controller } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ExecutorService } from './executor.service';
import { APITEST_CONFIG } from '../apitest.config';

@Controller(`${APITEST_CONFIG.routePrefix}/executor`)
export class ExecutorController {
    private logger:Logger
    constructor(private readonly runnerService: ExecutorService) {
      this.logger = new Logger(ExecutorController.name)
    }

    // @Post("runTask")
    // @HttpCode(200)
    // dispatchTask(@Body() taskDto:DispatchDto, @Res() response) {
    //   var res = new DispatchVo().getDefault()
    //   // this.logger.debug(taskDto)
    //   if (!taskDto.name || !taskDto.data) {
    //     res.status = 400
    //     res.message = "post /apiRunner/execute error"
    //     res.errMsg = "body param not found name or data"
    //     this.logger.error(JSON.stringify(taskDto))
    //     response.status(400).send(res)
    //   }
    //   try {
    //     this.runnerService.taskRun(taskDto).then(resp => {
    //       // response.status(200).send(res)
    //     }).catch(err => {
    //       // 执行任务失败
    //       this.logger.error("task run error","")
    //       this.logger.error(err,"")
    //       res.errMsg = err.message
    //       res.status = 101
    //       res.message = "dispatch task failed"
    //       response.status(500).send(res)
    //     })
    //     response.status(200).send(res)
    //   } catch(err) {
    //     // 发起任务失败
    //     this.logger.error("dispatcg  run task  error","")
    //     this.logger.error(err,"")
    //     res.status = 102
    //     res.message = "dispatch failed"
    //     res.errMsg = err
    //     response.status(500).send(res)
    //   }
    // }
}
