package controllers

import (
	"fmt"
	//"strconv"

	"net/http"
	"plan-loader/models"
	"plan-loader/repos/qdocitemrepo"
	"plan-loader/repos/qdocrepo"
	"plan-loader/utils"

	"github.com/gin-gonic/gin"
)

// QueryDocGetAll handles a GET("/queryDoc") request.
// Only the DbQueryDoc header fields are populated.
func QueryDocGetAll(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := qdocrepo.GetAll()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APIQueryDoc, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		apiDataItems[i] = models.DbToAPIQueryDoc(dbDataItem, nil)
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// QueryDocGet handles a GET("/queryDoc/:id") Doc request.
// The record is found based on the given id.
func QueryDocGet(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)
	utils.ClearWarnings()
	dbData, err := qdocrepo.Get(id)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDoc := models.DbToAPIQueryDoc(dbData, nil)
	dbDocItems, err := qdocitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	apiDocItems := make([]models.APIQueryDocItem, len(dbDocItems))
	for i, dbDocItem := range dbDocItems {
		apiDocItems[i] = models.DbToAPIQueryDocItem(dbDocItem)
	}
	apiDoc.Items = apiDocItems
	c.JSON(http.StatusOK, apiDoc)
}

// QueryDocGetFromName handles a GET("/queryDocName/:name") request.
// The record is found based on the given name (=DbQueryName).
func QueryDocGetFromName(c *gin.Context) {
	dbQueryName := c.Param("name")
	utils.ClearWarnings()
	dbData, err := qdocrepo.GetFromName(dbQueryName)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDoc := models.DbToAPIQueryDoc(dbData, nil)
	dbDocItems, err := qdocitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	apiDSItems := make([]models.APIQueryDocItem, len(dbDocItems))
	for i, dbDocItem := range dbDocItems {
		apiDSItems[i] = models.DbToAPIQueryDocItem(dbDocItem)
	}
	apiDoc.Items = apiDSItems
	c.JSON(http.StatusOK, apiDoc)
}

// QueryDocPut handles a PUT("/queryDoc/:id")
// Because there are children, QueryDocPut also handles delete requests, as
// a DELETE request doesn't take a structure (so the childred would be
// unknown)
// If the DbQueryDoc header is to be deleted, the id variable is negated.
// This function assumes that DbQueryDocItem child records that are to be
// deleted have their original ids negated and new DbQueryDocItem records
// have a 0 ID.
func QueryDocPut(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)

	var apiData models.APIQueryDoc
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbDocItems := make([]models.DbQueryDocItem, len(apiData.Items))
	for i, apiDocItem := range apiData.Items {
		var err error
		dbDocItems[i], err = models.APIToDbQueryDocItem(apiDocItem)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
	}
	dbData, err := models.APIToDbQueryDoc(apiData)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}

	if id < 0 {
		err := queryDocDelete(-id, dbDocItems)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
		return
	}

	for i, dbDocItem := range dbDocItems {
		if dbDocItem.ID > 0 {
			// DocItem exists -- put
			_, err := qdocitemrepo.Put(dbDocItem.ID, dbDocItem)
			if err != nil {
				//fmt.Println("Error A", utils.GetWarnings())
				c.JSON(http.StatusBadRequest, utils.GetWarnings())
				return
			}
		} else if dbDocItem.ID < 0 {
			// DocItem should be deleted
			err := queryDocItemDelete(dbDocItem)
			if err != nil {
				//fmt.Println("Error C", utils.GetWarnings())
				c.JSON(http.StatusBadRequest, utils.GetWarnings())
				return
			}
		} else {
			// DocItem doesn't exist -- post
			var err error
			dbDocItems[i], err = queryDocItemCreate(dbData, dbDocItem)
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
	_, err = qdocrepo.Put(id, dbData)
	if err != nil {
		//fmt.Println("Error E", utils.GetWarnings())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
	} else {
		apiDocItems := make([]models.APIQueryDocItem, docItemCount)
		compactedItems := dbDocItems[0:docItemCount]
		for i, dbDocItem := range compactedItems {
			apiDocItems[i] = models.DbToAPIQueryDocItem(dbDocItem)
		}
		apiData = models.DbToAPIQueryDoc(dbData, apiDocItems)

		c.JSON(http.StatusOK, apiData)
	}
}

// QueryDocPost handles a POST("/queryDoc") request.
func QueryDocPost(c *gin.Context) {
	var apiData models.APIQueryDoc
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbData, err := models.APIToDbQueryDoc(apiData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}
	id, insertErr := qdocrepo.Post(dbData)
	if insertErr != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}

	apiData.ID = id
	// Save DocItems with new parent ID
	dbDocItems := make([]models.DbQueryDocItem, len(apiData.Items))
	for i, apiDocItem := range apiData.Items {
		if apiDocItem.ItemKind != "delete" {
			dbDocItem, convertErr := models.APIToDbQueryDocItem(apiDocItem)
			if convertErr != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
			dbDocItem.QueryID = id
			var err error
			dbDocItems[i], err = queryDocItemCreate(dbData, dbDocItem)
			if err != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
		}
	}
	for i, dbDocItem := range dbDocItems {
		apiData.Items[i] = models.DbToAPIQueryDocItem(dbDocItem)
	}

	c.JSON(http.StatusCreated, apiData)
}

// Support functions

// queryDocDelete deletes the parent record and all child records.
func queryDocDelete(id int64, items []models.DbQueryDocItem) error {
	fmt.Println("Start docDelete")
	for _, item := range items {
		err := queryDocItemDelete(item)
		if err != nil {
			return err
		}
	}
	err := qdocrepo.Delete(id)
	return err
}

// queryDocItemCreate creates child records
func queryDocItemCreate(dbDocHead models.DbQueryDoc, dbDocItem models.DbQueryDocItem) (
	models.DbQueryDocItem, error) {
	itemID, err := qdocitemrepo.Post(dbDocItem)
	if err != nil {
		utils.PushWarnings(err.Error())
		return dbDocItem, err
	}
	dbDocItem.ID = itemID
	return dbDocItem, err
}

// queryDocItemDelete deletes chind records
func queryDocItemDelete(dbDocItem models.DbQueryDocItem) error {
	id := dbDocItem.ID
	if id < 0 {
		id = -id
	}
	err := qdocitemrepo.Delete(id)
	if err != nil {
		return err
	}
	return err
}
