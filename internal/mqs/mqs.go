package mqs

import (
	"context"

	"github.com/zeromicro/go-queue/kq"
	"github.com/zeromicro/go-zero/core/service"

	"lexa-engine/internal/config"
	"lexa-engine/internal/svc"
)

func Consumers(c config.Config, ctx context.Context, svcContext *svc.ServiceContext) []service.Service {
	return []service.Service{
		//Listening for changes in consumption flow status
		kq.MustNewQueue(c.KqConsumerConf, NewApiSyncSuccess(ctx, svcContext)),
		kq.MustNewQueue(c.TaskConsumerConf, NewTaskSuccess(ctx, svcContext)),
	}
}
