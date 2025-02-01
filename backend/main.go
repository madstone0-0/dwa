package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	app := gin.Default()

	app.GET("/info", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"msg": "Dwa backend server",
		})
	})

	app.Run()
}
