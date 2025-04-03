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

func ItemRoutes(ctx context.Context, pool db.Pool, rg *gin.RouterGroup) {
	item := rg.Group("/item")

	//get the items by the vendor id and then return them
	item.GET("/:vId", func(c *gin.Context) {
		vId := c.Param("vId")
		vIdUUID, err := utils.ParseUUID(vId)

		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		sr := vendor.All(ctx, pool, vIdUUID)
		utils.SendSR(c, sr)
	})

	item.POST("/add", func(c *gin.Context) {
		var body repository.InsertItemParams
		err := utils.ParseBody(c, &body)

		if err != nil {
			return
		}

		sr := vendor.Add(ctx, pool, body)
		utils.SendSR(c, sr)
	})

	item.PUT("/update", func(c *gin.Context) {
		var body repository.UpdateItemParams
		err := utils.ParseBody(c, &body)

		if err != nil {
			return
		}

		sr := vendor.Update(c, pool, body)
		utils.SendSR(c, sr)
	})

}
