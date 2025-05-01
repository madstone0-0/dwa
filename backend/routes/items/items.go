package items

import (
	"backend/db"
	"backend/internal/utils"
	"backend/services/vendor"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ItemsRoute(ctx context.Context, pool db.Pool, rg *gin.Engine) {
	items := rg.Group("/items")

	items.GET("/all", func(c *gin.Context) {
		sr := vendor.All(ctx, pool)
		utils.SendSR(c, sr)
	})

	items.GET("/:iid", func(c *gin.Context) {
		iid := c.Params.ByName("iid")
		iidUUID, err := utils.ParseUUID(iid)

		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		sr := vendor.ByIid(ctx, pool, iidUUID)
		utils.SendSR(c, sr)
	})
}
