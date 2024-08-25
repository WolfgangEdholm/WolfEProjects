package controllers

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

// Route routes web request to the appropriate handler.
func Route(r *gin.Engine) *gin.Engine {
	fmt.Printf("IN ROUTER")
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	routes := r.Group("/api")
	{
		// database system api

		routes.GET("/db/databases", GetAllDatabases)
		routes.GET("/db/setCurrentDatabase/:database", SetCurrentDatabase)
		routes.GET("/db/tables", GetAllTables)
		routes.GET("/db/tableInfo/:table", GetTableInfo)
		routes.GET("/db/foreignKeys/:database", GetForeignKeys)

		// read write queries api

		routes.POST("/query", GetQuery)
		routes.POST("/query/list", GetList)
		routes.POST("/query/write", WriteQuery)

		// query document api

		routes.GET("/queryDoc", QueryDocGetAll)
		routes.GET("/queryDoc/:id", QueryDocGet)
		routes.GET("/queryDocName/:name", QueryDocGetFromName)
		routes.POST("/queryDoc", QueryDocPost)
		routes.PUT("/queryDoc/:id", QueryDocPut)

		routes.GET("/dataIntegrity", DataIntegrityGetAll)
		routes.GET("/dataIntegrity/:id", DataIntegrityGet)
		routes.GET("/dataIntegrityName/:name", DataIntegrityGetFromName)
		routes.POST("/dataIntegrity", DataIntegrityPost)
		routes.PUT("/dataIntegrity/:id", DataIntegrityPut)
		routes.GET("/dataIntegrityItems", DataIntegrityGetAllQueryItems)

		routes.GET("/structIntegrity", StructIntegrityGetAll)
		routes.GET("/structIntegrity/:id", StructIntegrityGet)
		routes.GET("/structIntegrityName/:name", StructIntegrityGetFromName)
		routes.POST("/structIntegrity", StructIntegrityPost)
		routes.PUT("/structIntegrity/:id", StructIntegrityPut)
		routes.GET("/structIntegrityItems", StructIntegrityGetAllItems)
		routes.POST("/structIntegrityQueryItems", StructIntegrityPostQueryItems)

		// transoformer document api

		routes.GET("/transDoc", TransDocGetAll)
		routes.GET("/transDoc/:id", TransDocGet)
		routes.GET("/transDocName/:name", TransDocGetFromName)
		routes.POST("/transDoc", TransDocPost)
		routes.PUT("/transDoc/:id", TransDocPut)

		routes.GET("/transSourceIn", TransSourceInGetAll)
		routes.GET("/transSourceIn/:id", TransSourceInGet)
		routes.GET("/transSourceInName/:name", TransSourceInGetFromName)
		routes.POST("/transSourceIn", TransSourceInPost)
		routes.PUT("/transSourceIn/:id", TransSourceInPut)
		routes.GET("/transSourceInItems", TransSourceInGetAllItems)

		routes.GET("/transSourceOut", TransSourceOutGetAll)
		routes.GET("/transSourceOut/:id", TransSourceOutGet)
		routes.GET("/transSourceOutName/:name", TransSourceOutGetFromName)
		routes.POST("/transSourceOut", TransSourceOutPost)
		routes.PUT("/transSourceOut/:id", TransSourceOutPut)
		routes.GET("/transSourceOutItems", TransSourceOutGetAllItems)
		routes.POST("/transSourceOutTransItems", TransSourceOutPostTransItems)

		// user api

		routes.GET("/user", UserGetAll)
		routes.GET("/user/:id", UserGet)
		routes.POST("/user", UserPost)
		routes.PUT("/user/:id", UserPut)
		routes.DELETE("/user/:id", UserDelete)

		// to be retired

		routes.GET("/segment", SegmentGetAll)
		routes.GET("/segment/:id", SegmentGet)
		routes.PUT("/segment/:id", SegmentPut)
		routes.POST("/segment", SegmentPost)
		// Replaced with Pust (negative id)
		// routes.DELETE("/segment/:id", SegmentDelete)
	}

	return r
}
