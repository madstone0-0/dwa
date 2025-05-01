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

// UserTypeMiddleware ensures the user has the required user type (e.g., buyer or vendor) before allowing access.
func UserTypeMiddleware(userType utils.UserType) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if the Authorization header is present
		if authHeaders, ok := c.Request.Header["Authorization"]; ok {
			logging.Infof("AuthHeaders: %v", authHeaders)

			// Parse the JWT token using utility function
			token, err := utils.ParseJWT(authHeaders[0], jwt.MapClaims{})

			// Handle any error while parsing the token
			if err != nil {
				utils.SendErrAbort(c, http.StatusInternalServerError, err)
				return
			}

			// Try to extract the "userType" field from token claims
			uType, ok := (token.Claims).(jwt.MapClaims)["userType"]
			logging.Infof("User Type: %v", uType)

			// If userType not present in token
			if !ok {
				utils.SendErrAbort(c, http.StatusBadRequest, errors.New("no user type in token"))
				return
			}

			// Check if the userType in token matches the required one
			if utils.ParseUserType(uType.(string)) != userType {
				utils.SendErrAbort(
					c,
					http.StatusUnauthorized,
					fmt.Errorf("must be a %s to access this route", utils.StringifyUserType(userType)),
				)
				return
			}

			// User type matches — allow access to the next handler
			c.Next()
			return
		}
	}
}
