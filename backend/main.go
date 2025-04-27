package main

import (
	"backend/config"
	"backend/db"
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/routes/auth"
	"backend/routes/buyers"
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

var Enver utils.Enver = utils.DefaultEnv{}

func main() {
	ctx := context.Background()
	pool, closeFunc, err := db.NewPool(ctx, config.Database{
		Name:     Enver.Env("DB_NAME"),
		Username: Enver.Env("DB_USER"),
		Hostname: Enver.Env("DB_HOST"),
		Password: Enver.Env("DB_PASS"),
		Port:     Enver.Env("DB_PORT"),
	})

	if err != nil {
		logging.Fatalf("Cannot connect to db")
	}

	defer closeFunc()

	app := gin.Default()

	if Enver.Env("GIN_MODE") == "debug" {
		app.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"http://localhost:5173"},
			AllowCredentials: true,
			MaxAge:           12 * time.Hour,
		}))
	}

	app.Use(gin.Recovery())

	app.GET("/info", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, "Dwa backend server")
	})

	app.GET("/health", func(c *gin.Context) {
		utils.SendMsg(c, http.StatusOK, statusText)
	})

	app.GET("/db", func(c *gin.Context) {
		version, err := misc.Health(ctx, pool)
		utils.SendSR(c, utils.ServiceReturn[string]{
			Status:     http.StatusOK,
			Data:       version,
			ServiceErr: err,
		})
	})

	auth.AuthRoutes(ctx, pool, app)

	vendors.VendorRoutes(ctx, pool, app)
	buyers.BuyerRoutes(ctx, pool, app)

	app.Run(fmt.Sprintf("%s:%s", Enver.Env("HOST"), Enver.Env("PORT")))
}
