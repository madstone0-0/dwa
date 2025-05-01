package auth

import (
	"backend/db"
	"backend/internal/utils"
	"backend/middleware"
	"backend/routes/auth/user"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(ctx context.Context, pool db.Pool, rg *gin.Engine) {
	auth := rg.Group("/auth")

	auth.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "Auth route")
	})

	auth.GET("/ping", middleware.AuthMiddleware(), func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "pong")
	})

	user.UserAuthRoutes(ctx, pool, auth)
}
