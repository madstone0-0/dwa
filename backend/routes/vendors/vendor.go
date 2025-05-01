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

// VendorRoutes sets up the routes related to vendors
func VendorRoutes(ctx context.Context, pool db.Pool, rg *gin.Engine) {
	// Group routes under "/vendor"
	vendor := rg.Group("/vendor")
	// Apply authentication middleware for all routes under "/vendor"
	vendor.Use(middleware.AuthMiddleware())
	// Apply user type middleware to ensure the user is a vendor
	vendor.Use(middleware.UserTypeMiddleware(utils.VENDOR))

	// GET /vendor/info — A simple route that returns a message confirming it's the vendor route
	vendor.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "Vendor Route")
	})

	// Set up the item-related routes for vendors
	item.ItemRoutes(ctx, pool, vendor)

	// Set up the transaction-related routes for vendors
	transaction.TransactionRoutes(ctx, pool, vendor)
}
