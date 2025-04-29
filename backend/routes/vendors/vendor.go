package vendors

import (
	"backend/db"
	"backend/internal/utils"
	"backend/middleware"
	"backend/routes/vendors/item"
	transaction "backend/routes/vendors/transactions"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func VendorRoutes(ctx context.Context, pool db.Pool, rg *gin.Engine) {
	vendor := rg.Group("/vendor")
	vendor.Use(middleware.AuthMiddleware())
	vendor.Use(middleware.UserTypeMiddleware(utils.VENDOR))

	vendor.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "Vendor Route")
	})

	item.ItemRoutes(ctx, pool, vendor)
	transaction.TransactionRoutes(ctx, pool, vendor)
}
