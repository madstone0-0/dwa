package buyers

import (
	"backend/db"
	"backend/internal/utils"
	"backend/middleware"
	"backend/routes/buyers/cart"
	"backend/routes/buyers/payment"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

// BuyerRoutes sets up the routes for the buyer-related endpoints
func BuyerRoutes(ctx context.Context, pool db.Pool, rg *gin.Engine) {
	// Group routes under "/buyer"
	buyer := rg.Group("/buyer")

	// Apply authentication middleware to ensure the user is authenticated
	buyer.Use(middleware.AuthMiddleware())

	// Apply user type middleware to ensure the user is a BUYER
	buyer.Use(middleware.UserTypeMiddleware(utils.BUYER))

	// GET /buyer/info — Responds with a simple message indicating the buyer route
	buyer.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "Buyer Route")
	})

	// Set up payment routes for buyers
	payment.PaymentRoutes(ctx, pool, buyer)

	// Set up cart routes for buyers
	cart.CartRoutes(ctx, pool, buyer)
}
