package user

import (
	"backend/db"
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/services/auth"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func UserAuthRoutes(ctx context.Context, pool db.Pool, rg *gin.RouterGroup) {
	user := rg.Group("/user")

	user.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "User auth")
	})

	user.POST("/signup", func(c *gin.Context) {
		var body auth.SignupUser
		err := utils.ParseBody(c, &body)

		if err != nil {
			return
		}

		sr := auth.SignUp(ctx, pool, body)
		utils.SendSR(c, sr)
	})

	user.POST("/login", func(c *gin.Context) {
		var body auth.LoginUser
		err := utils.ParseBody(c, &body)

		if err != nil {
			return
		}

		sr := auth.Login(ctx, pool, body)
		utils.SendSR(c, sr)
	})
}
