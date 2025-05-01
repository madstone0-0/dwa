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

// AuthRoutes sets up the main /auth route group and its subroutes
func AuthRoutes(ctx context.Context, pool db.Pool, rg *gin.Engine) {
	// Create the "/auth" route group
	auth := rg.Group("/auth")

	// GET /auth/info — simple route to confirm auth routing is working
	auth.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "Auth route")
	})

	// GET /auth/ping — protected route to verify JWT authentication
	auth.GET("/ping", middleware.AuthMiddleware(), func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "pong")
	})

	// Mount user-related auth routes under "/auth/user"
	user.UserAuthRoutes(ctx, pool, auth)
}
