package middleware

import (
	"backend/internal/logging"
	"backend/internal/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var DefaultEnv utils.Enver = utils.DefaultEnv{}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if authHeaders, ok := c.Request.Header["Authorization"]; ok {
			logging.Infof("AuthHeaders: %v", authHeaders)
			token, err := utils.ParseJWT(authHeaders[0], jwt.MapClaims{})

			if err != nil {
				utils.SendErrAbort(c, http.StatusInternalServerError, err)
				return
			}

			if !token.Valid {
				utils.SendErrAbort(c, http.StatusUnauthorized, errors.New("invalid token"))
			}

			logging.Infof("Token: %v", token)
			c.Next()
			return
		}
		utils.SendErrAbort(c, http.StatusUnauthorized, errors.New("Unauthorized"))

	}
}
