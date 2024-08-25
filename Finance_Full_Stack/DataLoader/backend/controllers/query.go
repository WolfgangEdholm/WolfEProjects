package controllers

import (
	"fmt"
	//"strconv"

	"net/http"
	"plan-loader/models"
	"plan-loader/repos/queryrepo"
	"plan-loader/utils"

	"github.com/gin-gonic/gin"
)

// GetList handles a POST/query/list request
func GetList(c *gin.Context) {
	fmt.Printf("GetList\n")
	var lr models.ListRequest
	utils.ClearWarnings()
	bindErr := c.BindJSON(&lr)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	fmt.Printf("SQL=%s\n", lr.Request)
	dbDataItems, err := queryrepo.GetList(lr)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
	}
	//c.JSON(http.StatusOK, gin.H(dbDataItems))
	//c.Data(http.StatusOK, "application/json", dbDataItems)
	c.Data(http.StatusOK, gin.MIMEJSON, dbDataItems)
}

// GetQuery handles a POST/query request
func GetQuery(c *gin.Context) {
	fmt.Printf("GetQuery\n")
	var qr models.QueryRequest
	utils.ClearWarnings()
	bindErr := c.BindJSON(&qr)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	fmt.Printf("SQL=%s\n", qr.Request)
	dbDataItems, err := queryrepo.GetQuery(qr)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
	}
	//c.JSON(http.StatusOK, gin.H(dbDataItems))
	//c.Data(http.StatusOK, "application/json", dbDataItems)
	c.Data(http.StatusOK, gin.MIMEJSON, dbDataItems)
}

// WriteQuery handles a POST/writeData request
func WriteQuery(c *gin.Context) {
	fmt.Printf("WriteQuery\n")
	var saveData models.QuerySave
	utils.ClearWarnings()
	bindErr := c.BindJSON(&saveData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	err := queryrepo.WriteSql(saveData)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
	}
	c.JSON(http.StatusOK, "OK")
}

// Support functions
