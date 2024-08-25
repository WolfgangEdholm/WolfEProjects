package main

import (
	//"fmt"

	"plan-loader/controllers"
	"plan-loader/utils"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	//if !utils.IsRelease {
		log.SetOutput(os.Stdout)
	//}
	log.Print("Starting Test Backend")
	var err error = godotenv.Load()
	if err != nil {
		log.Fatalf("Error getting env, %v", err)
	}
	utils.SysDirectory = os.Getenv("DB_DSSYS")
	// fmt.Printf("STARTUP db=%s\n", os.Getenv("DB_DSSYS"))
	// utils.DBInitialize(os.Getenv("DB_DRIVER"), os.Getenv("DB_USER"),
	// 	os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"), os.Getenv("DB_PORT"),
	// 	os.Getenv("DB_NAME"), os.Getenv("DB_TIMEZONE_CONTINENT"),
	// 	os.Getenv("DB_TIMEZONE_CITY"))
	utils.DBInitialize(os.Getenv("DB_DRIVER"), os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"), os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"))
	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	
	// Dummy value to remove warning
	r.SetTrustedProxies([]string{"192.168.1.2"})

	//config.AllowOrigins = []string{"*"}
	config.AllowMethods = []string{"DELETE", "GET", "HEAD", "POST", "PUT"}
	r.Use(cors.New(config))
	controllers.Route(r)
	r.Run()
}
