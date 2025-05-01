package transaction

import (
	"backend/db"
	"backend/internal/utils"
	"backend/services/transaction"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

// TransactionRoutes sets up the routes related to transactions
func TransactionRoutes(ctx context.Context, pool db.Pool, rg *gin.RouterGroup) {
	// Group routes under "/transactions"
	transactionRoute := rg.Group("/transactions")

	// GET /transactions/:vId — Fetches transactions by vendor ID (vId)
	transactionRoute.GET("/:vId", func(c *gin.Context) {
		// Retrieve the vendor ID from the URL parameters
		vId := c.Param("vId")
		// Parse the vendor ID to UUID format
		vIdUUID, err := utils.ParseUUID(vId)

		// If there is an error parsing the vendor ID, return an error response
		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		// Fetch the transactions associated with the vendor from the transaction service
		sr := transaction.GetTransactionsByVendorId(ctx, pool, vIdUUID)
		// Send the service response back to the client
		utils.SendSR(c, sr)
	})

	// GET /transactions/total/:vId — Fetches total sales by vendor ID (vId)
	transactionRoute.GET("total/:vId", func(c *gin.Context) {
		// Retrieve the vendor ID from the URL parameters
		vId := c.Param("vId")
		// Parse the vendor ID to UUID format
		vIdUUID, err := utils.ParseUUID(vId)

		// If there is an error parsing the vendor ID, return an error response
		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		// Fetch the total sales associated with the vendor from the transaction service
		sr := transaction.GetTotalSalesByVendorId(ctx, pool, vIdUUID)
		// Send the service response back to the client
		utils.SendSR(c, sr)
	})

	// GET /transactions/total/:vId/:iId — Fetches total sales for a specific item by vendor ID (vId) and item ID (iId)
	transactionRoute.GET("total/:vId/:iId", func(c *gin.Context) {
		// Retrieve the vendor ID and item ID from the URL parameters
		vId, iId := c.Param("vId"), c.Param("iId")

		// Parse the vendor ID to UUID format
		vIdUUID, err := utils.ParseUUID(vId)

		// If there is an error parsing the vendor ID, return an error response
		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		// Parse the item ID to UUID format
		iIdUUID, err := utils.ParseUUID(iId)

		// If there is an error parsing the item ID, return an error response
		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		// Fetch the total sales associated with the vendor and item from the transaction service
		sr := transaction.GetTotalSalesByVendorIdAndItemId(ctx, pool, vIdUUID, iIdUUID)
		// Send the service response back to the client
		utils.SendSR(c, sr)
	})
}
