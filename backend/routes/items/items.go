package items

import (
	"backend/db"
	"backend/internal/utils"
	"backend/services/vendor"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ItemsRoute sets up the routes related to items
func ItemsRoute(ctx context.Context, pool db.Pool, rg *gin.Engine) {
	// Group routes under "/items"
	items := rg.Group("/items")

	// GET /items/all — Fetches all items from the vendor service and responds with the result
	items.GET("/all", func(c *gin.Context) {
		// Call the vendor service to get all items
		sr := vendor.All(ctx, pool)
		// Send the service response back to the client
		utils.SendSR(c, sr)
	})

	// GET /items/:iid — Fetches a specific item by its ID (iid)
	items.GET("/:iid", func(c *gin.Context) {
		// Retrieve the item ID from the URL parameters
		iid := c.Params.ByName("iid")
		// Parse the item ID to UUID format
		iidUUID, err := utils.ParseUUID(iid)

		// If there is an error parsing the item ID, return an error response
		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		// Fetch the item by its UUID from the vendor service
		sr := vendor.ByIid(ctx, pool, iidUUID)
		// Send the service response back to the client
		utils.SendSR(c, sr)
	})
}
