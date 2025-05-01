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
				// Check if the token is expired
				if errors.Is(err, jwt.ErrTokenExpired) {
					utils.SendErrAbort(c, http.StatusUnauthorized, errors.New("token expired"))
					return
				}
				utils.SendErrAbort(c, http.StatusInternalServerError, err)
				return
			}

			// Check if the token is valid
			if !token.Valid {
				utils.SendErrAbort(c, http.StatusUnauthorized, errors.New("invalid token"))
				return
			}

			logging.Infof("Token: %v", token)

			c.Next()
			return
		}
		utils.SendErrAbort(c, http.StatusUnauthorized, errors.New("Unauthorized"))

	}
}

func CartAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		bidStr := c.Param("bId")
		bid, err := utils.ParseUUID(bidStr)
		logging.Infof("Bid str: %s", bidStr)
		if err != nil {
			utils.SendErrAbort(c, http.StatusInternalServerError, err)
			return
		}

		if authHeaders, ok := c.Request.Header["Authorization"]; ok {
			logging.Infof("AuthHeaders: %v", authHeaders)
			token, err := utils.ParseJWT(authHeaders[0], jwt.MapClaims{})

			if err != nil {
				utils.SendErrAbort(c, http.StatusInternalServerError, err)
				return
			}

			uid, ok := (token.Claims).(jwt.MapClaims)["uid"]
			if !ok {
				utils.SendErrAbort(c, http.StatusBadRequest, errors.New("invalid token"))
				return
			}

			uid, err = utils.ParseUUID(uid.(string))
			if err != nil {
				utils.SendErrAbort(c, http.StatusBadRequest, errors.New("invalid token"))
				return
			}

			logging.Infof("Bid: %s\nUid: %s", bid, uid)
			if uid != bid {
				utils.SendErrAbort(c, http.StatusBadRequest, errors.New("cannot access other users' carts"))
				return
			}

			c.Next()
			return
		}
	}
}
