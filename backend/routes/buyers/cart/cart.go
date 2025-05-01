package cart

import (
	"backend/db"
	"backend/internal/utils"
	"backend/middleware"
	"backend/repository"
	"backend/services/cart"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CartRoutes(ctx context.Context, pool db.Pool, rg *gin.RouterGroup) {
	cartRoute := rg.Group("/cart")

	cartRoute.POST("/add", func(c *gin.Context) {
		var body repository.AddToCartParams
		err := utils.ParseBody(c, &body)

		if err != nil {
			return
		}

		sr := cart.AddToCart(ctx, pool, body)
		utils.SendSR(c, sr)
	})

	cartRoute.POST("/:bId/clear", middleware.CartAuthMiddleware(), func(c *gin.Context) {
		bId := c.Param("bId")
		bIdUUID, err := utils.ParseUUID(bId)

		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		sr := cart.ClearCart(ctx, pool, bIdUUID)
		utils.SendSR(c, sr)
	})

	cartRoute.GET("/:bId", middleware.CartAuthMiddleware(), func(c *gin.Context) {
		bId := c.Param("bId")
		bIdUUID, err := utils.ParseUUID(bId)

		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		sr := cart.GetCartItemsForBuyer(ctx, pool, bIdUUID)
		utils.SendSR(c, sr)
	})

	cartRoute.POST("/remove", func(c *gin.Context) {
		var body repository.DeleteCartItemParams
		err := utils.ParseBody(c, &body)

		if err != nil {
			return
		}
		sr := cart.RemoveFromCart(ctx, pool, body)
		utils.SendSR(c, sr)

	})

	cartRoute.PUT("/update", func(c *gin.Context) {
		var body repository.UpdateQuantityOfCartItemParams
		err := utils.ParseBody(c, &body)

		if err != nil {
			return
		}

		sr := cart.UpdateCartItemQuantity(ctx, pool, body)
		utils.SendSR(c, sr)
	})
}
