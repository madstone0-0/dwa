package user

import (
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/services/auth"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func UserAuthRoutes(ctx context.Context, pool *pgxpool.Pool, rg *gin.RouterGroup) {
	user := rg.Group("/user")

	user.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "User auth")
	})

	user.POST("/signup", func(c *gin.Context) {
		var body auth.SignupUser
		err := c.ShouldBindJSON(&body)
		logging.Infof("Body -> %s", body)

		if err != nil {
			logging.Errorf("Error parsing body -> %v", err)
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		sr := auth.SignUp(ctx, pool, body)
		utils.SendSR(c, sr)
	})

	user.POST("/login", func(c *gin.Context) {
		var body auth.LoginUser
		err := c.ShouldBindJSON(&body)
		logging.Infof("Body -> %s", body)

		if err != nil {
			logging.Errorf("Error parsing body -> %v", err)
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		sr := auth.Login(ctx, pool, body)
		utils.SendSR(c, sr)
	})
}
