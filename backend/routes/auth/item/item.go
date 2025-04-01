package item

import (
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
		vIdUUID, err := utils.ParseUUID(vId)

		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		items, err := q.GetItemsByVendorId(ctx, vIdUUID)
	})
}
