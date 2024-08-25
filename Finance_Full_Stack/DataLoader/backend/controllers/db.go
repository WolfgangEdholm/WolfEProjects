package controllers

import (
	"fmt"
	//"strconv"

	"net/http"
	"plan-loader/models"
	"plan-loader/repos/dbrepo"
	"plan-loader/utils"

	"github.com/gin-gonic/gin"
)

// GetAllDatabases handles a GET("/db/databases") request.
func GetAllDatabases(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := dbrepo.GetAllDatabases()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
	}
	c.JSON(http.StatusOK, dbDataItems)
}

// SetCurrentDatabase handles a GET("/db/setCurrentDatabase/:database") request.
func SetCurrentDatabase(c *gin.Context) {
	database := c.Param("database")
	utils.SetCurrentDatabase(database)
	c.JSON(http.StatusOK, database)
}

// GetAllTables handles a Get("/db/tables") request.
func GetAllTables(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := dbrepo.GetAllTables()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
	}
	fmt.Printf("GetAllTables\n")
	apiDataItems := make([]models.APITable, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		dbColumnItems, err := dbrepo.GetTableInfo(dbDataItem.TableName)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
		apiDataItems[i] = models.DbToAPITable(dbDataItem, dbColumnItems)
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// GetTableInfo handles a GET("/db/tableInfo/:table") request.
// GetTableInfo gets information about all columns belonging to
// the given table.
func GetTableInfo(c *gin.Context) {
	table := c.Param("table")
	//fmt.Printf("TableName=%s\n", table)
	utils.ClearWarnings()
	dbDataItems, err := dbrepo.GetTableInfo(table)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
	}
	c.JSON(http.StatusOK, dbDataItems)
}

// GetForeignKeys handles a GET("/db/foreignKeys/:database") request.
// GetForeignKeys gets information about all indexes in the given table.
func GetForeignKeys(c *gin.Context) {
	database := c.Param("database")
	// table := c.Param("table")
	// fmt.Printf("DataBase=%s TableName=%s\n", database, table)
	utils.ClearWarnings()
	dbDataItems, err := dbrepo.GetForeignKeys(database)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
	}
	c.JSON(http.StatusOK, dbDataItems)
}

// Support functions
