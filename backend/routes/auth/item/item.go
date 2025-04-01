package item

import (
	"backend/repository"
	"context"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func ItemRoutes(ctx context.Context, pool *pgxpool.Pool, rg *gin.RouterGroup) {
	item := rg.Group("/item")

	item.GET("/:vId", func(c *gin.Context) {
		//get the items by the vendor id and then return them
		q := repository.New(pool)
		vId := c.Param("vId")

		id, err := uuid.FromString(vId)

		items, error := q.GetItemsByVendorId(ctx, vId)
	})
}
