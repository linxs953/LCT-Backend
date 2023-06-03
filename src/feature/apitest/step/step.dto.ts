

export class CreateStepDto  {
    stepName: String
    preFn: String
    afterFn: String
    apiMethod: String
    apiUrl: String
    apiParam: String
    apiData: String
    apiHeaders: String
    extractSpec: String
    updatePerson: String
    createPerson: String
    createTime: Date
    updateTime: Date

    verify = () => {
        return null
    }
}