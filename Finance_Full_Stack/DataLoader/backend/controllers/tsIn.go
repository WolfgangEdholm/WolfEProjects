package controllers

import (
	"fmt"
	//"strconv"

	"net/http"
	"plan-loader/models"
	"plan-loader/repos/tsinitemrepo"
	"plan-loader/repos/tsinrepo"
	"plan-loader/utils"

	"github.com/gin-gonic/gin"
)

// TransSourceInGetAllItems handles a GET("/transSourceInItems") request.
// This is the main query from the DataIntegrity system.
func TransSourceInGetAllItems(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := tsinitemrepo.GetIntegrity()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APITransItegrityCheckItem, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		apiDataItems[i] = models.DbToAPITransItegrityCheckItem(dbDataItem)
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// TransSourceInGetAll handles a GET("/transSourceIn") request.
// Only the DbTSIn header fields are populated.
func TransSourceInGetAll(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := tsinrepo.GetAll()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APITSIn, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		apiDataItems[i] = models.DbToAPITSIn(dbDataItem, nil)
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// TransSourceInGet handles a GET("/transSourceIn/:id") request.
// The record is found based on the given id.
func TransSourceInGet(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)
	utils.ClearWarnings()
	dbData, err := tsinrepo.Get(id)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDS := models.DbToAPITSIn(dbData, nil)
	dbDSItems, err := tsinitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	apiDSItems := make([]models.APITSInItem, len(dbDSItems))
	for i, dbSIItem := range dbDSItems {
		apiDSItems[i] = models.DbToAPITSInItem(dbSIItem)
	}
	apiDS.Items = apiDSItems
	c.JSON(http.StatusOK, apiDS)
}

// TransSourceInGetFromName handles a GET("/transSourceInName/:name") request.
// The record is found based on the given name (=DbTransName).
func TransSourceInGetFromName(c *gin.Context) {
	dbTransName := c.Param("name")
	utils.ClearWarnings()
	dbData, err := tsinrepo.GetFromName(dbTransName)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDS := models.DbToAPITSIn(dbData, nil)
	dbDSItems, err := tsinitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	apiDSItems := make([]models.APITSInItem, len(dbDSItems))
	for i, dbSIItem := range dbDSItems {
		apiDSItems[i] = models.DbToAPITSInItem(dbSIItem)
	}
	apiDS.Items = apiDSItems
	c.JSON(http.StatusOK, apiDS)
}

// TransSourceInPut handles a PUT("/transSourceIn/:id") request.
// Because there are children, TransSourceInPut also handles delete requests,
// as a DELETE request doesn't take a structure (so the childred would be
// unknown)
// If the DbTSIn header record is to be deleted, the id variable is negated.
// This function assumes that any DbTSInItem child records that are to be
// deleted have their original ids negated and new DbTSInItem records
// have a 0 id.
func TransSourceInPut(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)

	var apiData models.APITSIn
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbDSInItems := make([]models.DbTSInItem, len(apiData.Items))
	for i, apiSIItem := range apiData.Items {
		var err error
		dbDSInItems[i], err = models.APIToDbTSInItem(apiSIItem)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
	}
	dbData, err := models.APIToDbTSIn(apiData)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}

	if id < 0 {
		err := transSourceInDelete(-id, dbDSInItems)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
		return
	}

	for i, dbDSInItem := range dbDSInItems {
		if dbDSInItem.ID > 0 {
			// DSItem exists -- put
			_, err := tsinitemrepo.Put(dbDSInItem.ID, dbDSInItem)
			if err != nil {
				//fmt.Println("Error A", utils.GetWarnings())
				c.JSON(http.StatusBadRequest, utils.GetWarnings())
				return
			}
		} else {
			if dbDSInItem.ID < 0 {
				// DSItem should be deleted
				err := tsInItemDelete(dbDSInItem)
				if err != nil {
					//fmt.Println("Error C", utils.GetWarnings())
					c.JSON(http.StatusBadRequest, utils.GetWarnings())
					return
				}
			} else {
				// DSItem doesn't exist -- post
				var err error
				dbDSInItems[i], err = tsInItemCreate(dbData, dbDSInItem)
				if err != nil {
					//fmt.Println("Error D", utils.GetWarnings())
					c.JSON(http.StatusBadRequest, utils.GetWarnings())
					return
				}
			}
		}
	}
	// Remove deleted DSItems
	offset := 0
	for index, dbSIItem := range dbDSInItems {
		if dbSIItem.ID < 0 {
			offset++
		} else {
			dbDSInItems[index-offset] = dbDSInItems[index]
		}
	}
	dsItemCount := len(dbDSInItems) - offset
	// Updating Trans Source record
	_, err = tsinrepo.Put(id, dbData)
	if err != nil {
		//fmt.Println("Error E", utils.GetWarnings())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
	} else {
		apiDSItems := make([]models.APITSInItem, dsItemCount)
		compactedItems := dbDSInItems[0:dsItemCount]
		for i, dbSIItem := range compactedItems {
			apiDSItems[i] = models.DbToAPITSInItem(dbSIItem)
		}
		apiData = models.DbToAPITSIn(dbData, apiDSItems)

		c.JSON(http.StatusOK, apiData)
	}
}

// TransSourceInPost handles a POST("/transSourceIn") request.
func TransSourceInPost(c *gin.Context) {
	var apiData models.APITSIn
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbData, err := models.APIToDbTSIn(apiData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}
	id, insertErr := tsinrepo.Post(dbData)
	if insertErr != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}

	apiData.ID = id
	// Save DSItems with new parent ID
	dbDSItems := make([]models.DbTSInItem, len(apiData.Items))
	for i, apiSIItem := range apiData.Items {
		if apiSIItem.ItemKind != "delete" {
			dbSIItem, convertErr := models.APIToDbTSInItem(apiSIItem)
			if convertErr != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
			dbSIItem.TSID = id
			var err error
			dbDSItems[i], err = tsInItemCreate(dbData, dbSIItem)
			if err != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
		}
	}
	for i, dbSIItem := range dbDSItems {
		apiData.Items[i] = models.DbToAPITSInItem(dbSIItem)
	}

	c.JSON(http.StatusCreated, apiData)
}

// Support functions

// transSourceInDelete deletes a Trans Source In record and all chldren.
func transSourceInDelete(id int64, items []models.DbTSInItem) error {
	fmt.Println("Start transSourceDelete")
	for _, item := range items {
		err := tsInItemDelete(item)
		if err != nil {
			return err
		}
	}
	err := tsinrepo.Delete(id)
	return err
}

// transSourceInDelete creates a Trans Source In item record dbDSInItem.
func tsInItemCreate(
	dbDSInHead models.DbTSIn, dbDSInItem models.DbTSInItem) (
	models.DbTSInItem, error) {
	itemID, err := tsinitemrepo.Post(dbDSInItem)
	if err != nil {
		utils.PushWarnings(err.Error())
		return dbDSInItem, err
	}
	dbDSInItem.ID = itemID
	return dbDSInItem, err
}

// deleteDSInItem deletes a Trans Source In item record dbDSInItem.
func tsInItemDelete(dbSIItem models.DbTSInItem) error {
	id := dbSIItem.ID
	if id < 0 {
		id = -id
	}
	err := tsinitemrepo.Delete(id)
	if err != nil {
		return err
	}
	return err
}
