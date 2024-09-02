// Code generated by goctl. DO NOT EDIT.
package handler

import (
	"net/http"

	api "lexa-engine/internal/handler/api"
	cache "lexa-engine/internal/handler/cache"
	scene "lexa-engine/internal/handler/scene"
	syncApi "lexa-engine/internal/handler/syncApi"
	syncTask "lexa-engine/internal/handler/syncTask"
	task "lexa-engine/internal/handler/task"
	"lexa-engine/internal/svc"

	"github.com/zeromicro/go-zero/rest"
)

func RegisterHandlers(server *rest.Server, serverCtx *svc.ServiceContext) {
	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/",
				Handler: indexHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodPost,
				Path:    "/api",
				Handler: syncApi.SyncApiHandler(serverCtx),
			},
		},
		rest.WithPrefix("/sync"),
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/get",
				Handler: syncTask.GetSyncRecordHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/create",
				Handler: syncTask.NewSyncRecordHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/update",
				Handler: syncTask.UpdateSyncRecordHandler(serverCtx),
			},
		},
		rest.WithPrefix("/sync/record"),
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/getSceneWithId",
				Handler: task.GetSceneWithIdHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/getPreActions",
				Handler: task.GetPreActionsHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/create",
				Handler: task.CreateTaskHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/update",
				Handler: task.UpdateTaskHandler(serverCtx),
			},
			{
				Method:  http.MethodDelete,
				Path:    "/delete",
				Handler: task.DeleteTaskHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/getOne",
				Handler: task.GetTaskHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/getList",
				Handler: task.GetTaskListHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/run/:taskId",
				Handler: task.RunTaskHandler(serverCtx),
			},
		},
		rest.WithPrefix("/task"),
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodPost,
				Path:    "/testdata/init",
				Handler: cache.TdInitHandler(serverCtx),
			},
		},
		rest.WithPrefix("/cache"),
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodPost,
				Path:    "/new",
				Handler: scene.NewSceneHandler(serverCtx),
			},
			{
				Method:  http.MethodPut,
				Path:    "/update",
				Handler: scene.ModifySceneHandler(serverCtx),
			},
			{
				Method:  http.MethodDelete,
				Path:    "/delete",
				Handler: scene.DeleteSceneHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/get",
				Handler: scene.GetSceneHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/allScenes",
				Handler: scene.GetSceneListHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/search",
				Handler: scene.SearchScenesHandler(serverCtx),
			},
		},
		rest.WithPrefix("/scene"),
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/:apiId/getApiDetail",
				Handler: api.GetApiDetailHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/getApiList",
				Handler: api.GetApiListHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/searchApi",
				Handler: api.SearchApiHandler(serverCtx),
			},
		},
		rest.WithPrefix("/api"),
	)
}
