package user

import (
	"backend/db"
	"backend/internal/utils"
	"backend/services/auth"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UserAuthRoutes defines routes under "/user" for authentication and user management
func UserAuthRoutes(ctx context.Context, pool db.Pool, rg *gin.RouterGroup) {
	// Create a route group for user-related endpoints
	user := rg.Group("/user")

	// GET /user/info — basic endpoint for checking user auth route
	user.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "User auth")
	})

	// POST /user/signup — handles user registration
	user.POST("/signup", func(c *gin.Context) {
		var body auth.SignupUser

		// Parse and validate request body
		err := utils.ParseBody(c, &body)
		if err != nil {
			return
		}

		// Call signup service with `isVendor = false`
		sr := auth.SignUp(ctx, pool, body, false)

		// Send service response back to client
		utils.SendSR(c, sr)
	})

	// POST /user/login — handles user login
	user.POST("/login", func(c *gin.Context) {
		var body auth.LoginUser

		// Parse and validate request body
		err := utils.ParseBody(c, &body)
		if err != nil {
			return
		}

		// Call login service
		sr := auth.Login(ctx, pool, body)

		// Send service response
		utils.SendSR(c, sr)
	})

	// PUT /user/update — handles user profile updates
	user.PUT("/update", func(c *gin.Context) {
		var body auth.UpdateUser

		// Parse and validate request body
		err := utils.ParseBody(c, &body)
		if err != nil {
			return
		}

		// Call update service
		sr := auth.Update(ctx, pool, body)

		// Send response
		utils.SendSR(c, sr)
	})

	// DELETE /user/delete/:uid — deletes a user by UID
	user.DELETE("/delete/:uid", func(c *gin.Context) {
		// Extract user ID from path
		uid := c.Params.ByName("uid")

		// Parse UID string into UUID
		uidUUID, err := utils.ParseUUID(uid)
		if err != nil {
			utils.SendErr(c, http.StatusBadRequest, err)
			return
		}

		// Call delete service
		sr := auth.Delete(ctx, pool, uidUUID)

		// Send response
		utils.SendSR(c, sr)
	})
}
