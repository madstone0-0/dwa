package main

import (
	"backend/config"
	"backend/db"
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/routes/auth"
	"backend/routes/buyers"
	"backend/routes/items"
	"backend/routes/vendors"
	misc "backend/services"
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const statusText string = `They have taken the bridge and the second hall.
We have barred the gates but cannot hold them for long.
The ground shakes, drums... drums in the deep. We cannot get out.
A shadow lurks in the dark. We can not get out.
They are coming.
`
// Enver loads environment variables
var Enver utils.Enver = utils.DefaultEnv{}

func main() {
	// Create a background context for the application
	ctx := context.Background()

	// Initialize DB connection pool using credentials from environment
	pool, closeFunc, err := db.NewPool(ctx, config.Database{
		Name:     Enver.Env("DB_NAME"),
		Username: Enver.Env("DB_USER"),
		Hostname: Enver.Env("DB_HOST"),
		Password: Enver.Env("DB_PASS"),
		Port:     Enver.Env("DB_PORT"),
	})

		// Handle DB connection error
	if err != nil {
		logging.Fatalf("Cannot connect to db")
	}

	defer closeFunc()

	app := gin.Default()
// Apply CORS config only in debug mode
	if Enver.Env("GIN_MODE") == "debug" {
		app.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"http://localhost:5173", "*"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"},
			AllowCredentials: true,
			MaxAge:           12 * time.Hour,
		}))
	}

	// Use built-in recovery middleware to handle panics gracefully
	app.Use(gin.Recovery())
// Define basic route to check if the server is up
	app.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "Dwa backend server")
	})

	// Define health route with a status message
	app.GET("/health", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, statusText)
	})

	// Route to test DB connection by returning DB version
	app.GET("/db", func(c *gin.Context) {
		version, err := misc.Health(ctx, pool)
		utils.SendSR(c, utils.ServiceReturn[string]{
			Status:     http.StatusOK,
			Data:       version,
			ServiceErr: err,
		})
	})


	// Register all route groups for authentication, items, vendors, and buyers
	auth.AuthRoutes(ctx, pool, app)

	items.ItemsRoute(ctx, pool, app)
	vendors.VendorRoutes(ctx, pool, app)
	buyers.BuyerRoutes(ctx, pool, app)



	// Start the server on the host and port from environment variables
	app.Run(fmt.Sprintf("%s:%s", Enver.Env("HOST"), Enver.Env("PORT")))
}
