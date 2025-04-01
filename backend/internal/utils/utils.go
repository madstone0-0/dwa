package utils

import (
	"backend/internal/logging"
	"encoding/hex"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
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

// parseUUID converts a string UUID in standard form to a byte array.
// Taken from https://github.com/jackc/pgx/blob/master/pgtype/uuid.go
func ParseUUID(src string) (uuid pgtype.UUID, err error) {
	var dst [16]byte
	switch len(src) {
	case 36:
		src = src[0:8] + src[9:13] + src[14:18] + src[19:23] + src[24:]
	case 32:
		// dashes already stripped, assume valid
	default:
		// assume invalid.
		return uuid, fmt.Errorf("cannot parse UUID %v", src)
	}

	buf, err := hex.DecodeString(src)
	if err != nil {
		return uuid, err
	}

	copy(dst[:], buf)
	uuid = pgtype.UUID{Bytes: dst, Valid: true}

	return uuid, err
}
