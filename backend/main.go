package main

import (
	"backend/config"
	"backend/db"
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/routes/auth"
	misc "backend/services"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

const statusText string = `They have taken the bridge and the second hall.
We have barred the gates but cannot hold them for long.
The ground shakes, drums... drums in the deep. We cannot get out.
A shadow lurks in the dark. We can not get out.
They are coming.
`

func env(key string) string {
	viper.SetConfigFile(".env")
	err := viper.ReadInConfig()
	if err != nil {
		logging.Fatalf("Error reading .env file -> %v", err)
	}
	v, ok := viper.Get(key).(string)
	if !ok {
		logging.Fatalf("Error reading key -> %s", key)
	}
	return v
}

func main() {
	ctx := context.Background()
	pool, closeFunc, err := db.NewPool(ctx, config.Database{
		Name:     env("DB_NAME"),
		Username: env("DB_USER"),
		Hostname: env("DB_HOST"),
		Password: env("DB_PASS"),
		Port:     env("DB_PORT"),
	})

	if err != nil {
		logging.Fatalf("Cannot connect to db")
	}

	defer closeFunc()

	app := gin.Default()

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

	app.Run()
}
