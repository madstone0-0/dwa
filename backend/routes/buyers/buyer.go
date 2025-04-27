package buyers

import (
	"backend/db"
	"backend/internal/utils"
	"backend/middleware"
	"backend/routes/buyers/payment"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func BuyerRoutes(ctx context.Context, pool db.Pool, rg *gin.Engine) {
	buyer := rg.Group("/buyer")
	buyer.Use(middleware.AuthMiddleware())
	buyer.Use(middleware.UserTypeMiddleware(middleware.BUYER))

	buyer.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "Buyer Route")
	})

	payment.PaymentRoutes(ctx, pool, buyer)
}
