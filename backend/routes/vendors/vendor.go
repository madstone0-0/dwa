package vendors

import (
	"backend/db"
	"backend/internal/utils"
	"backend/routes/vendors/item"
	transaction "backend/routes/vendors/transactions"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func VendorRoutes(ctx context.Context, pool db.Pool, rg *gin.Engine) {
	vendor := rg.Group("/vendor")

	vendor.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "Vendor Route")
	})

	item.ItemRoutes(ctx, pool, vendor)
	transaction.TransactionRoutes(ctx, pool, vendor)
}
