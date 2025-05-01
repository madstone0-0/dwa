package payment

import (
	"backend/db"
	"backend/internal/utils"
	"backend/repository"
	"backend/services/payment"
	"context"

	"github.com/gin-gonic/gin"
)

// PaymentRoutes sets up routes for handling payment-related operations
func PaymentRoutes(ctx context.Context, pool db.Pool, rg *gin.RouterGroup) {
	// Group routes under "/pay"
	payRoute := rg.Group("/pay")

	// POST /pay/initialize — Initialize a payment transaction
	payRoute.POST("/initialize", func(c *gin.Context) {
		var body repository.CreateTransactionParams
		err := utils.ParseBody(c, &body)

		if err != nil {
			return
		}

		sr := payment.CreateTransactionRecord(ctx, pool, body)
		utils.SendSR(c, sr)
	})
}
