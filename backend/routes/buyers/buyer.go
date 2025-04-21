package buyers

import (
	"backend/db"
	"backend/internal/utils"
	"backend/routes/buyers/payment"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func BuyerRoutes(ctx context.Context, pool db.Pool, rg *gin.Engine) {
	buyer := rg.Group("/buyer")

	buyer.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "Buyer Route")
	})

	payment.PaymentRoutes(ctx, pool, buyer)
}
