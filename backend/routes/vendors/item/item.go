package item

import (
	"backend/db"
	"backend/internal/utils"
	"backend/repository"
	"backend/services/vendor"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ItemRoutes sets up the routes related to items
func ItemRoutes(ctx context.Context, pool db.Pool, rg *gin.RouterGroup) {
	// Group routes under "/item"
	item := rg.Group("/item")

	// GET /item/:vId — Fetches items by vendor ID (vId)
	item.GET("/:vId", func(c *gin.Context) {
		// Retrieve the vendor ID from the URL parameters
		vId := c.Param("vId")
		// Parse the vendor ID to UUID format
		vIdUUID, err := utils.ParseUUID(vId)

		// If there is an error parsing the vendor ID, return an error response
		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		// Fetch the items associated with the vendor from the vendor service
		sr := vendor.ByVid(ctx, pool, vIdUUID)
		// Send the service response back to the client
		utils.SendSR(c, sr)
	})

	// POST /item/add — Adds a new item to the vendor's inventory
	item.POST("/add", func(c *gin.Context) {
		// Parse the request body into InsertItemParams structure
		var body repository.InsertItemParams
		err := utils.ParseBody(c, &body)

		// If there is an error parsing the body, return early
		if err != nil {
			return
		}

		// Add the new item using the vendor service
		sr := vendor.Add(ctx, pool, body)
		// Send the service response back to the client
		utils.SendSR(c, sr)
	})

	// PUT /item/update — Updates an existing item in the vendor's inventory
	item.PUT("/update", func(c *gin.Context) {
		// Parse the request body into UpdateItemParams structure
		var body repository.UpdateItemParams
		err := utils.ParseBody(c, &body)

		// If there is an error parsing the body, return early
		if err != nil {
			return
		}

		// Update the item using the vendor service
		sr := vendor.Update(c, pool, body)
		// Send the service response back to the client
		utils.SendSR(c, sr)
	})

	// DELETE /item/delete/:iId — Deletes an item by its ID (iId)
	item.DELETE("/delete/:iId", func(c *gin.Context) {
		// Retrieve the item ID from the URL parameters
		iId := c.Param("iId")
		// Parse the item ID to UUID format
		iIdUUID, err := utils.ParseUUID(iId)

		// If there is an error parsing the item ID, return an error response
		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		// Delete the item using the vendor service
		sr := vendor.Delete(c, pool, iIdUUID)
		// Send the service response back to the client
		utils.SendSR(c, sr)
	})
}
