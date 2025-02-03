package main

import (
	"backend/config"
	"backend/db"
	"backend/internal/logging"
	"log"
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
	pool, closeFunc, err := db.NewPool(config.Database{
		Name:     env("DB_NAME"),
		Username: env("DB_USER"),
		Hostname: env("DB_HOST"),
		Password: env("DB_PASS"),
		Port:     env("DB_PORT"),
	})

	if err != nil {
		log.Fatal("Cannot connect to db")
	}

	defer closeFunc()

	app := gin.Default()

	app.GET("/info", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"msg": "Dwa backend server",
		})
	})

	app.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"msg": statusText,
		})
	})

	app.Run()
}
