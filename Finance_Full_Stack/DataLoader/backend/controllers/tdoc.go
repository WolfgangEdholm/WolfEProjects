package controllers

import (
	"fmt"
	//"strconv"

	"net/http"
	"plan-loader/models"
	"plan-loader/repos/tdocitemrepo"
	"plan-loader/repos/tdocrepo"
	"plan-loader/utils"

	"github.com/gin-gonic/gin"
)

// TransDocGetAll handles a GET("/transDoc") request.
// Only the DbTransDocItem fields are populated.
func TransDocGetAll(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := tdocrepo.GetAll()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APITransDoc, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		apiDataItems[i] = models.DbToAPITransDoc(dbDataItem, nil)
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// TransDocGet handles a GET("/transDoc/:id") Doc request.
func TransDocGet(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)
	utils.ClearWarnings()
	dbData, err := tdocrepo.Get(id)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDoc := models.DbToAPITransDoc(dbData, nil)
	dbDocItems, err := tdocitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	apiDocItems := make([]models.APITransDocItem, len(dbDocItems))
	for i, dbDocItem := range dbDocItems {
		apiDocItems[i] = models.DbToAPITransDocItem(dbDocItem)
	}
	apiDoc.Items = apiDocItems
	c.JSON(http.StatusOK, apiDoc)
}

// TransDocGetFromName handles a GET("/transDocName/:name") request.
// The record is found based on the given name (=DbTransName).
func TransDocGetFromName(c *gin.Context) {
	dbQueryName := c.Param("name")
	utils.ClearWarnings()
	dbData, err := tdocrepo.GetFromName(dbQueryName)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDoc := models.DbToAPITransDoc(dbData, nil)
	dbDocItems, err := tdocitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	apiTSItems := make([]models.APITransDocItem, len(dbDocItems))
	for i, dbDocItem := range dbDocItems {
		apiTSItems[i] = models.DbToAPITransDocItem(dbDocItem)
	}
	apiDoc.Items = apiTSItems
	c.JSON(http.StatusOK, apiDoc)
}

// TransDocPut handles a PUT("/transDoc/:id")
// Because there are children, QueryDocPut also handles delete requests, as
// a DELETE request doesn't take a structure (so the childred would be
// unknown)
// If the DbQueryDoc header is to be deleted, the id variable is negated.
// This function assumes that DbQueryDocItem child records that are to be
// deleted have their original ids negated and new DbQueryDocItem records
// have a 0 ID.
func TransDocPut(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)

	var apiData models.APITransDoc
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbDocItems := make([]models.DbTransDocItem, len(apiData.Items))
	for i, apiDocItem := range apiData.Items {
		var err error
		dbDocItems[i], err = models.APIToDbTransDocItem(apiDocItem)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
	}
	dbData, err := models.APIToDbTransDoc(apiData)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}

	if id < 0 {
		err := transDocDelete(-id, dbDocItems)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
		return
	}

	for i, dbDocItem := range dbDocItems {
		if dbDocItem.ID > 0 {
			// DocItem exists -- put
			_, err := tdocitemrepo.Put(dbDocItem.ID, dbDocItem)
			if err != nil {
				//fmt.Println("Error A", utils.GetWarnings())
				c.JSON(http.StatusBadRequest, utils.GetWarnings())
				return
			}
		} else if dbDocItem.ID < 0 {
			// DocItem should be deleted
			err := transDocItemDelete(dbDocItem)
			if err != nil {
				//fmt.Println("Error C", utils.GetWarnings())
				c.JSON(http.StatusBadRequest, utils.GetWarnings())
				return
			}
		} else {
			// DocItem doesn't exist -- post
			var err error
			dbDocItems[i], err = transDocItemCreate(dbData, dbDocItem)
			if err != nil {
				//fmt.Println("Error D", utils.GetWarnings())
				c.JSON(http.StatusBadRequest, utils.GetWarnings())
				return
			}
		}
	}
	// Remove deleted DocItems
	offset := 0
	for index, dbDocItem := range dbDocItems {
		if dbDocItem.ID < 0 {
			offset++
		} else {
			dbDocItems[index-offset] = dbDocItems[index]
		}
	}
	docItemCount := len(dbDocItems) - offset
	// Updating Doc
	_, err = tdocrepo.Put(id, dbData)
	if err != nil {
		//fmt.Println("Error E", utils.GetWarnings())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
	} else {
		apiDocItems := make([]models.APITransDocItem, docItemCount)
		compactedItems := dbDocItems[0:docItemCount]
		for i, dbDocItem := range compactedItems {
			apiDocItems[i] = models.DbToAPITransDocItem(dbDocItem)
		}
		apiData = models.DbToAPITransDoc(dbData, apiDocItems)

		c.JSON(http.StatusOK, apiData)
	}
}

// TransDocPost handles a POST("/transDoc") request.
func TransDocPost(c *gin.Context) {
	var apiData models.APITransDoc
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbData, err := models.APIToDbTransDoc(apiData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}
	id, insertErr := tdocrepo.Post(dbData)
	if insertErr != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}

	apiData.ID = id
	// Save DocItems with new parent ID
	dbDocItems := make([]models.DbTransDocItem, len(apiData.Items))
	for i, apiDocItem := range apiData.Items {
		if apiDocItem.ItemKind != "delete" {
			dbDocItem, convertErr := models.APIToDbTransDocItem(apiDocItem)
			if convertErr != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
			dbDocItem.TransID = id
			var err error
			dbDocItems[i], err = transDocItemCreate(dbData, dbDocItem)
			if err != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
		}
	}
	for i, dbDocItem := range dbDocItems {
		apiData.Items[i] = models.DbToAPITransDocItem(dbDocItem)
	}

	c.JSON(http.StatusCreated, apiData)
}

// Support functions

// transDocDelete deletes the parent record and all child records.
func transDocDelete(id int64, items []models.DbTransDocItem) error {
	fmt.Println("Start docDelete")
	for _, item := range items {
		err := transDocItemDelete(item)
		if err != nil {
			return err
		}
	}
	err := tdocrepo.Delete(id)
	return err
}

// transDocItemCreate creates child records
func transDocItemCreate(dbDocHead models.DbTransDoc, dbDocItem models.DbTransDocItem) (
	models.DbTransDocItem, error) {
	itemID, err := tdocitemrepo.Post(dbDocItem)
	if err != nil {
		utils.PushWarnings(err.Error())
		return dbDocItem, err
	}
	dbDocItem.ID = itemID
	return dbDocItem, err
}

// transDocItemDelete deletes chind records
func transDocItemDelete(dbDocItem models.DbTransDocItem) error {
	id := dbDocItem.ID
	if id < 0 {
		id = -id
	}
	err := tdocitemrepo.Delete(id)
	if err != nil {
		return err
	}
	return err
}
