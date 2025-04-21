package payment

import (
	"backend/db"
	"backend/internal/utils"
	"backend/repository"
	"backend/services/payment"
	"context"

	"github.com/gin-gonic/gin"
)

func PaymentRoutes(ctx context.Context, pool db.Pool, rg *gin.RouterGroup) {
	payRoute := rg.Group("/pay")

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
