package items

import (
	"backend/db"
	"backend/internal/utils"
	"backend/services/vendor"
	"context"

	"github.com/gin-gonic/gin"
)

func ItemsRoute(ctx context.Context, pool db.Pool, rg *gin.Engine) {
	buyer := rg.Group("/items")

	buyer.GET("/all", func(c *gin.Context) {
		sr := vendor.All(ctx, pool)
		utils.SendSR(c, sr)
	})
}
