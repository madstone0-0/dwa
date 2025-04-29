package middleware

import (
	"backend/internal/logging"
	"backend/internal/utils"
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func UserTypeMiddleware(userType utils.UserType) gin.HandlerFunc {
	return func(c *gin.Context) {
		if authHeaders, ok := c.Request.Header["Authorization"]; ok {
			logging.Infof("AuthHeaders: %v", authHeaders)
			token, err := utils.ParseJWT(authHeaders[0], jwt.MapClaims{})

			if err != nil {
				utils.SendErrAbort(c, http.StatusInternalServerError, err)
				return
			}

			uType, ok := (token.Claims).(jwt.MapClaims)["userType"]
			logging.Infof("User Type: %v", uType)
			if !ok {
				utils.SendErrAbort(c, http.StatusBadRequest, errors.New("no user type in token"))
				return
			}

			if utils.ParseUserType(uType.(string)) != userType {
				utils.SendErrAbort(c, http.StatusUnauthorized, fmt.Errorf("must be a %s to access this route", utils.StringifyUserType(userType)))
				return
			}

			c.Next()
			return
		}

	}
}
