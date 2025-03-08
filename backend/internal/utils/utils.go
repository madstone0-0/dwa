package utils

import (
	"backend/internal/logging"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

type ServiceError struct {
	Err    error
	Status int
}

type ServiceReturn[T any] struct {
	Status     int
	Data       T
	ServiceErr *ServiceError
}

type JMap map[string]any

func SendData[T any](c *gin.Context, status int, data T) {
	c.JSON(status, gin.H{
		"data": data,
	})
}

func SendMsg(c *gin.Context, status int, msg string) {
	SendData(c, status, JMap{"msg": msg})
}

func SendErr(c *gin.Context, status int, err error) {
	SendData(c, status, JMap{"err": err.Error()})
}

func SendSR[T any](c *gin.Context, sr ServiceReturn[T]) {
	if sr.ServiceErr != nil {
		SendErr(c, sr.ServiceErr.Status, sr.ServiceErr.Err)
		return
	}

	SendData(c, sr.Status, sr.Data)
}

func MakeError(err error, status int) ServiceReturn[any] {
	return ServiceReturn[any]{
		ServiceErr: &ServiceError{
			Err:    err,
			Status: status,
		},
	}
}


func Env(key string) string {
	viper.SetConfigFile(".env")
	err := viper.ReadInConfig()
	if err != nil {
		logging.Fatalf("Error reading .env file -> %v", err)
	}
	v, ok := viper.Get(key).(string)
	if !ok {
		logging.Fatalf("Error reading key -> %s", key)
	}
	return v
}
