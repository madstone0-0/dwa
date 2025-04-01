package utils

import (
	"backend/internal/logging"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

// ServiceError describes the structure of an error returned by a service
type ServiceError struct {
	Err    error
	Status int
}

// ServiceReturn describes the structure of a service's response, i.e. the status
// data sent to the client and an error if any occurred
type ServiceReturn[T any] struct {
	Status     int
	Data       T
	ServiceErr *ServiceError
}

// JMap is a response map alias
type JMap map[string]any

// SendData sends data of type T to the client with a given status code
func SendData[T any](c *gin.Context, status int, data T) {
	c.JSON(status, gin.H{
		"data": data,
	})
}

// SendMsg is a convenience function to send a string message to the client
func SendMsg(c *gin.Context, status int, msg string) {
	SendData(c, status, JMap{"msg": msg})
}

// SendErr is a convenience function to send an error message to the client
func SendErr(c *gin.Context, status int, err error) {
	SendData(c, status, JMap{"err": err.Error()})
}

// SendSR sends a ServiceReturn to the client accounting for errors if any
func SendSR[T any](c *gin.Context, sr ServiceReturn[T]) {
	// If there's an error, send it to the client
	if sr.ServiceErr != nil {
		SendErr(c, sr.ServiceErr.Status, sr.ServiceErr.Err)
		return
	}

	SendData(c, sr.Status, sr.Data)
}

// MakeError is a ServiceError factory function to create a ServiceReturn with an error from an error and a status code
func MakeError(err error, status int) ServiceReturn[any] {
	return ServiceReturn[any]{
		ServiceErr: &ServiceError{
			Err:    err,
			Status: status,
		},
	}
}

// Env reads a key from the .env file and returns its value as a string
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
