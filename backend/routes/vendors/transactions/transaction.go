package transaction

import (
	"backend/db"
	"backend/internal/utils"
	"backend/services/transaction"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func TransactionRoutes(ctx context.Context, pool db.Pool, rg *gin.RouterGroup) {
	transactionRoute := rg.Group("/transactions")

	transactionRoute.GET("/:vId", func(c *gin.Context) {
		vId := c.Param("vId")
		vIdUUID, err := utils.ParseUUID(vId)

		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		sr := transaction.GetTransactionsByVendorId(ctx, pool, vIdUUID)
		utils.SendSR(c, sr)
	})

	transactionRoute.GET("total/:vId", func(c *gin.Context) {
		vId := c.Param("vId")
		vIdUUID, err := utils.ParseUUID(vId)

		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		sr := transaction.GetTotalSalesByVendorId(ctx, pool, vIdUUID)
		utils.SendSR(c, sr)
	})

	transactionRoute.GET("total/:vId/:iId", func(c *gin.Context) {
		vId, iId := c.Param("vId"), c.Param("iId")

		vIdUUID, err := utils.ParseUUID(vId)

		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		iIdUUID, err := utils.ParseUUID(iId)

		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		sr := transaction.GetTotalSalesByVendorIdAndItemId(ctx, pool, vIdUUID, iIdUUID)
		utils.SendSR(c, sr)
	})
}
