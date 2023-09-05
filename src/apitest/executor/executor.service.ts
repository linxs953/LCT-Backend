import { Injectable, Logger } from '@nestjs/common';
import { Collection } from './core/collection';
import { CollectionRunDto, CollectionRunResultVO } from './executor.dto';

@Injectable()
export class ExecutorService {
    private readonly apiRunnerLogger = new Logger(ExecutorService.name)
    taskRun(taskDto:CollectionRunDto, extendData:Array<{}>): Promise<any> {
        let runResult:CollectionRunResultVO
        this.apiRunnerLogger.log(`start run scene [${taskDto.name}]`)
        this.apiRunnerLogger.debug(`extend data ${JSON.stringify(extendData)}`)
        return new Promise(async (resolve, reject) => {
            var data = JSON.parse(JSON.stringify(taskDto))
            var suitcases = new Collection(data.name, data.data)
            suitcases.setExtendData(extendData)
            suitcases.collectionRun().then(resp => {
                if (resp.collectionStatus) {
                    runResult = {
                        status: 0,
                        message: "execute successfully",
                        data: resp.collectionResult
                    }
                } else {
                    runResult = {
                        data: resp.collectionResult,
                        error: resp.collectionFailDetail,
                        status: 1,
                        message: "execute failed"
                    }
                }
                resolve(runResult)
            }).catch(err => {
                runResult = {
                    error: err,
                    status: -1,
                    data: null,
                    message: "dispatch apiRun task failed"
                }
                this.apiRunnerLogger.error("dispatch apiRun task failed","")
                this.apiRunnerLogger.error(err,"")
                reject(runResult)
            })
        })
    }
}
