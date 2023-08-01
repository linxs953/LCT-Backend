
// todo: 列举所有接口，保证都能走middleware
let ROUTE_CONFIG = {
    "/apitest/taskService/getResult": {
        "query": ["runId"],
        "body": []
    },
    "/apitest/taskService/getRelation": {
        "query": ["taskId"],
        "body": []
    },
    "/apitest/taskService/start": {
        "query": ["taskId"],
        "body": []
    },
    "/apitest/taskService/getAllScene": {
        "query": ["taskId"],
        "body": []
    },
    "/uitest/widgetService/getWidgets": {
        "query": ["pageName"],
        "body": []
    },
    "/uitest/widgetService/getAllWidgets": {
        "query": [],
        "body": []
    },
    "/apitest/mkService/create": {
        "query": [],
        "body": ["moduleName","businessBelong","ownerName"]
    }
}

export default ROUTE_CONFIG