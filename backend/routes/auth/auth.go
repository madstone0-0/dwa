package auth

import (
	"backend/internal/utils"
	"backend/routes/auth/user"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func AuthRoutes(ctx context.Context, pool *pgxpool.Pool, rg *gin.Engine) {
	auth := rg.Group("/auth")

	auth.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "Auth route")
	})

	user.UserAuthRoutes(ctx, pool, auth)
}
