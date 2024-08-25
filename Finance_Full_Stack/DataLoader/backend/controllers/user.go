package controllers

import (
	//"fmt"
	//"strconv"
	//"log"

	"net/http"
	"plan-loader/models"
	"plan-loader/repos/userrepo"
	"plan-loader/utils"

	"github.com/gin-gonic/gin"
)

// UserGetAll handles a GET:id user request.
func UserGetAll(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := userrepo.GetAll()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APIUser, len(dbDataItems))
	for row := 0; row < len(dbDataItems); row++ {
		apiDataItems[row] = models.DbToAPIUser(dbDataItems[row])
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// UserGet handles a GET:id user request.
func UserGet(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)
	utils.ClearWarnings()
	dbData, err := userrepo.Get(id)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiData := models.DbToAPIUser(dbData)
	c.JSON(http.StatusOK, apiData)
}

// UserPut handles a PUT:id user request.
func UserPut(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)
	var apiData models.APIUser
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbData, conversionErr := models.APIToDbUser(apiData)
	if conversionErr != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbData, err := userrepo.Put(id, dbData)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
	} else {
		c.JSON(http.StatusCreated, apiData)
	}
}

// UserPost handles a POST user request.
func UserPost(c *gin.Context) {
	var apiData models.APIUser
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbData, conversionErr := models.APIToDbUser(apiData)
	if conversionErr != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
	}
	id, insertErr := userrepo.Post(dbData)
	if insertErr != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}
	apiData.ID = id
	c.JSON(http.StatusCreated, apiData)
}

// UserDelete handles a DETELTE:id user request.
func UserDelete(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)
	utils.ClearWarnings()
	err := userrepo.Delete(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
	} else {
		c.JSON(http.StatusNoContent, "Successful Deletion")
	}
}

// Support functions
