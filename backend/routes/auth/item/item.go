package item

import (
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

func ItemRoutes(ctx context.Context, pool *pgxpool.Pool, rg *gin.RouterGroup) {
	item := rg.Group("/item")

	item.GET("/:vId", func(c *gin.Context) {
		//get the items by the vendor id and then return them
		q := repository.New(pool)
		vId := c.Param("vId")
		var id pgtype.UUID
		err := id.Scan(vId)

		if err != nil {
			logging.Errorf("Error parsing vId to uuid -> %v", err)
			utils.SendErr(c, http.StatusInternalServerError, err)
			return
		}

		items, err := q.GetItemsByVendorId(ctx, id)

		if err != nil {
			utils.SendErr(c, http.StatusInternalServerError, err)
			return
		}

		utils.SendData(c, http.StatusOK, items)

	})

	item.GET("/:itemId", func(c *gin.Context){
		q := repository.New(pool)
		itemId := c.Param("itemId")
	})
}
