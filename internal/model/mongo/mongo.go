package model

import (
	"fmt"
	"lexa-engine/internal/config"
)

func GetMongoUrl(mongoConfig config.MongoConfig) string {
	var mongoUrl string
	if mongoConfig.MongoHost == "" || mongoConfig.MongoPort == 0 || mongoConfig.MongoUser == "" || mongoConfig.UseDb == "" {
		return mongoUrl
	}
	mongoUrl = fmt.Sprintf("mongodb://%v:%v@%v:%v/%v?authSource=admin&authMechanism=SCRAM-SHA-256&directConnection=true",
		mongoConfig.MongoUser,
		mongoConfig.MongoPasswd,
		mongoConfig.MongoHost,
		mongoConfig.MongoPort,
		mongoConfig.UseDb)
	return mongoUrl
}
