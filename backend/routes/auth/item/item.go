package item

import (
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func ItemRoutes(ctx context.Context, pool *pgxpool.Pool, rg *gin.RouterGroup) {
	item := rg.Group("/item")

	item.GET("/:vId", func(c *gin.Context) {
		//get the items by the vendor id and then return them
		q := repository.New(pool)
		vId := c.Param("vId")
		vIdUUID, err := utils.ParseUUID(vId)

		if err != nil {
			logging.Errorf("Error parsing uuid")
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		items, err := q.GetItemsByVendorId(ctx, vIdUUID)

		if err != nil {
			logging.Errorf("Error getting items by vendor Id")
			utils.SendErr(c, http.StatusInternalServerError, err)
			return
		}

		utils.SendData(c, http.StatusOK, items)
	})

	item.GET("/:itemId", func(c *gin.Context) {
		q := repository.New(pool)
		itemId := c.Param("itemId")

		itemUUID, err := utils.ParseUUID(itemId)

		if err != nil {
			logging.Errorf("Error parsing uuid")
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		item, err := q.GetItemByItemId(ctx, itemUUID)

		if err != nil {
			logging.Errorf("Error getting item by item Id")
			utils.SendErr(c, http.StatusInternalServerError, err)
			return
		}

		utils.SendData(c, http.StatusOK, item)

	})
}
