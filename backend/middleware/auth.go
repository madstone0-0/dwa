package middleware

import (
	"backend/internal/logging"
	"backend/internal/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// DefaultEnv is a default implementation of environment variables or config access.
var DefaultEnv utils.Enver = utils.DefaultEnv{}

// AuthMiddleware checks if the request has a valid JWT token before allowing access.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if Authorization header is present
		if authHeaders, ok := c.Request.Header["Authorization"]; ok {
			logging.Infof("AuthHeaders: %v", authHeaders)

			// Parse the JWT token
			token, err := utils.ParseJWT(authHeaders[0], jwt.MapClaims{})

			// Handle token parsing error
			if err != nil {
				// If the token is expired
				if errors.Is(err, jwt.ErrTokenExpired) {
					utils.SendErrAbort(c, http.StatusUnauthorized, errors.New("token expired"))
					return
				}
				// For any other error
				utils.SendErrAbort(c, http.StatusInternalServerError, err)
				return
			}

			// If token is not valid
			if !token.Valid {
				utils.SendErrAbort(c, http.StatusUnauthorized, errors.New("invalid token"))
				return
			}

			// Token is valid, continue to the next middleware or handler
			logging.Infof("Token: %v", token)
			c.Next()
			return
		}

		// No Authorization header found
		utils.SendErrAbort(c, http.StatusUnauthorized, errors.New("Unauthorized"))
	}
}

// CartAuthMiddleware ensures only the owner of the cart can access it.
func CartAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the buyer ID from the URL parameter
		bidStr := c.Param("bId")
		bid, err := utils.ParseUUID(bidStr)
		logging.Infof("Bid str: %s", bidStr)

		if err != nil {
			utils.SendErrAbort(c, http.StatusInternalServerError, err)
			return
		}

		// Check if Authorization header is present
		if authHeaders, ok := c.Request.Header["Authorization"]; ok {
			logging.Infof("AuthHeaders: %v", authHeaders)

			// Parse the JWT token
			token, err := utils.ParseJWT(authHeaders[0], jwt.MapClaims{})

			if err != nil {
				utils.SendErrAbort(c, http.StatusInternalServerError, err)
				return
			}

			// Extract user ID from token
			uid, ok := (token.Claims).(jwt.MapClaims)["uid"]
			if !ok {
				utils.SendErrAbort(c, http.StatusBadRequest, errors.New("invalid token"))
				return
			}

			// Convert the user ID to UUID
			uid, err = utils.ParseUUID(uid.(string))
			if err != nil {
				utils.SendErrAbort(c, http.StatusBadRequest, errors.New("invalid token"))
				return
			}

			logging.Infof("Bid: %s\nUid: %s", bid, uid)

			// Ensure the user is accessing their own cart
			if uid != bid {
				utils.SendErrAbort(c, http.StatusBadRequest, errors.New("cannot access other users' carts"))
				return
			}

			// All checks passed, continue
			c.Next()
			return
		}
	}
}
