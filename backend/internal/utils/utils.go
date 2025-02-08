package utils

import (
	"github.com/gin-gonic/gin"
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
