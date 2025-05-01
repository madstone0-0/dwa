package utils

import (
	"backend/internal/logging"
	"encoding/hex"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgtype"
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

func SendDataAbort[T any](c *gin.Context, status int, data T) {
	c.AbortWithStatusJSON(status, gin.H{
		"data": data,
	})
}

// SendMsg is a convenience function to send a string message to the client
func SendMsg(c *gin.Context, status int, msg string) {
	SendData(c, status, JMap{"msg": msg})
}

// SendErr is a convenience function to send an error message to the client
func SendErr(c *gin.Context, status int, err error) {
	switch err := err.(type) {
	case interface{ Unwrap() string }:
		SendData(c, status, JMap{"err": err.Unwrap()})
	case interface{ Unwrap() []error }:
		errs := err.Unwrap()

		errsList := make([]string, len(errs))
		for i, e := range errs {
			errsList[i] = e.Error()
		}

		SendData(c, status, JMap{"err": errsList})
	default:
		SendData(c, status, JMap{"err": err.Error()})
	}
}

func SendErrAbort(c *gin.Context, status int, err error) {
	SendDataAbort(c, status, JMap{"err": err.Error()})
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

// Enver is an interface to abstract getting environment vars to make mocking easier
type Enver interface {
	// Env reads a key from the environment and returns its value as a string
	Env(string) string
}

// env reads a key from the .env file and returns its value as a string
func env(key string) string {
	viper.SetConfigFile(".env")
	err := viper.ReadInConfig()
	if err != nil {
		v, ok := os.LookupEnv(key)
		if !ok {
			logging.Fatalf("Error reading .env file -> %v", err)
		}
		return v
	}
	v, ok := viper.Get(key).(string)
	if !ok {
		logging.Fatalf("Error reading key -> %s", key)
	}
	return v
}

type DefaultEnv struct{}

func (e DefaultEnv) Env(key string) string {
	return env(key)
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

func ParseBody[T any](c *gin.Context, body *T) (err error) {
	err = c.ShouldBindBodyWithJSON(body)
	if err != nil {
		logging.Errorf("Error parsing body -> %v", err)
		SendErr(c, http.StatusBadRequest, err)
		return err
	}

	return nil
}

func MakePointer[T any](t T) *T {
	return &t
}

func ParseJWT(tokenString string, claims jwt.MapClaims) (*jwt.Token, error) {
	wobearer := strings.TrimPrefix(tokenString, "Bearer ")
	return jwt.ParseWithClaims(wobearer, claims, func(t *jwt.Token) (any, error) {
		return []byte(DefaultEnv{}.Env("SECRET")), nil
	})
}

type UserType int

const (
	VENDOR UserType = iota
	BUYER
)

func ParseUserType(userString string) UserType {
	lower := strings.ToLower(userString)
	if lower == "vendor" {
		return VENDOR
	} else {
		return BUYER
	}
}

func StringifyUserType(ut UserType) string {
	if ut == VENDOR {
		return "vendor"
	} else {
		return "buyer"
	}
}

func FillPlaceholders(sql string, args []any) string {
	n := len(args)
	for i := range n {
		placeholderText := fmt.Sprintf("$%d", i+1)
		sql = strings.Replace(sql, placeholderText, fmt.Sprintf("%v", args[i]), 1)
	}
	return sql
}

func NumericEqual(a, b pgtype.Numeric) bool {
	// Check if both are valid or both are invalid
	if a.Valid != b.Valid {
		return false
	}

	// If both are invalid, they're considered equal
	if !a.Valid {
		return true
	}

	// Check if both are NaN
	if a.NaN && b.NaN {
		return true
	}

	// Check if one is NaN but the other isn't
	if a.NaN != b.NaN {
		return false
	}

	// Check InfinityModifier
	if a.InfinityModifier != b.InfinityModifier {
		return false
	}

	// If both are infinity of the same sign, they're equal
	if a.InfinityModifier == pgtype.Infinity {
		return true
	}

	// Check if the values are numerically equal
	// This needs to account for different representations of the same number
	// (e.g., 1.23 can be represented as 123 with Exp -2)

	// If both Int and Exp are the same, they're equal
	if a.Int.Cmp(b.Int) == 0 && a.Exp == b.Exp {
		return true
	}

	// Normalize both numbers to the same exponent and compare
	aExp := a.Exp
	bExp := b.Exp
	aInt := new(big.Int).Set(a.Int)
	bInt := new(big.Int).Set(b.Int)

	// Adjust the numbers to have the same exponent
	if aExp < bExp {
		// Scale bInt down
		scale := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(bExp-aExp)), nil)
		bInt.Mul(bInt, scale)
	} else if bExp < aExp {
		// Scale aInt down
		scale := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(aExp-bExp)), nil)
		aInt.Mul(aInt, scale)
	}

	// Compare the adjusted integers
	return aInt.Cmp(bInt) == 0
}
