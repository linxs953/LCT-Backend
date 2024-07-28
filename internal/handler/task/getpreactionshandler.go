package task

import (
	"net/http"

	"github.com/zeromicro/go-zero/rest/httpx"
	"lexa-engine/internal/logic/task"
	"lexa-engine/internal/svc"
	"lexa-engine/internal/types"
)

func GetPreActionsHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.GetPreActionsDto
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := task.NewGetPreActionsLogic(r.Context(), svcCtx)
		resp, err := l.GetPreActions(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
