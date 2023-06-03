

let ROUTE_CONFIG = {
    "/apitest/taskService/getResult": {
        "query": ["runId"],
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
    "/uitest/sceneDataService/getAllData": {
        "query": [],
        "body": []
    }
}

export default ROUTE_CONFIG