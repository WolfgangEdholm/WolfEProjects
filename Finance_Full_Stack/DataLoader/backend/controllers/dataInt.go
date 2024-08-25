package controllers

import (
	"fmt"
	//"strconv"

	"net/http"
	"plan-loader/models"
	"plan-loader/repos/diitemrepo"
	"plan-loader/repos/direpo"
	"plan-loader/utils"

	"github.com/gin-gonic/gin"
)

// DataIntegrityGetAllItems handles a GET("/dataIntegrityItems") request.
// This is the main query from the DataIntegrity system.
func DataIntegrityGetAllQueryItems(
	c *gin.Context,
) {
	utils.ClearWarnings()
	dbDataItems, err := diitemrepo.GetQueryIntegrity()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APIQueryItegrityCheckItem, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		apiDataItems[i] = models.DbToAPIQueryItegrityCheckItem(dbDataItem)
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// DataIntegrityGetAll handles a GET("/dataIntegrity") request.
// Only the DbQSIn header fields are populated.
func DataIntegrityGetAll(
	c *gin.Context,
) {
	utils.ClearWarnings()
	dbDataItems, err := direpo.GetAll()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APIDataIntegrity, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		apiDataItems[i] = models.DbToAPIDataIntegrity(dbDataItem, nil)
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// DataIntegrityGet handles a GET("/dataIntegrity/:id") request.
// The record is found based on the given id.
func DataIntegrityGet(
	c *gin.Context,
) {
	id := utils.GetInt64IdFromReqContext(c)
	utils.ClearWarnings()
	dbData, err := direpo.Get(id)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDS := models.DbToAPIDataIntegrity(dbData, nil)
	dbDSItems, err := diitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	apiDSItems := make([]models.APIDataIntegrityItem, len(dbDSItems))
	for i, dbSIItem := range dbDSItems {
		apiDSItems[i] = models.DbToAPIDataIntegrityItem(dbSIItem)
	}
	apiDS.Items = apiDSItems
	c.JSON(http.StatusOK, apiDS)
}

// DataIntegrityGetFromName handles a GET("/dataIntegrityName/:name") request.
// The record is found based on the given name (=DbQueryName).
func DataIntegrityGetFromName(
	c *gin.Context,
) {
	dbQueryName := c.Param("name")
	utils.ClearWarnings()
	dbData, err := direpo.GetFromName(dbQueryName)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDS := models.DbToAPIDataIntegrity(dbData, nil)
	dbDSItems, err := diitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	apiDSItems := make([]models.APIDataIntegrityItem, len(dbDSItems))
	for i, dbSIItem := range dbDSItems {
		apiDSItems[i] = models.DbToAPIDataIntegrityItem(dbSIItem)
	}
	apiDS.Items = apiDSItems
	c.JSON(http.StatusOK, apiDS)
}

// DataIntegrityPut handles a PUT("/dataIntegrity/:id") request.
// Because there are children, DataIntegrityPut also handles delete requests,
// as a DELETE request doesn't take a structure (so the childred would be
// unknown)
// If the DbQSIn header record is to be deleted, the id variable is negated.
// This function assumes that any DbQSInItem child records that are to be
// deleted have their original ids negated and new DbQSInItem records
// have a 0 id.
func DataIntegrityPut(
	c *gin.Context,
) {
	id := utils.GetInt64IdFromReqContext(c)

	var apiData models.APIDataIntegrity
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbDSInItems := make([]models.DbDataIntegrityItem, len(apiData.Items))
	for i, apiSIItem := range apiData.Items {
		var err error
		dbDSInItems[i], err = models.APIToDbDataIntegrityItem(apiSIItem)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
	}
	dbData, err := models.APIToDbDataIntegrity(apiData)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}

	if id < 0 {
		err := dataIntegrityDelete(-id, dbDSInItems)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
		return
	}

	for i, dbDSInItem := range dbDSInItems {
		if dbDSInItem.ID > 0 {
			// DSItem exists -- put
			_, err := diitemrepo.Put(dbDSInItem.ID, dbDSInItem)
			if err != nil {
				//fmt.Println("Error A", utils.GetWarnings())
				c.JSON(http.StatusBadRequest, utils.GetWarnings())
				return
			}
		} else {
			if dbDSInItem.ID < 0 {
				// DSItem should be deleted
				err := qsInItemDelete(dbDSInItem)
				if err != nil {
					//fmt.Println("Error C", utils.GetWarnings())
					c.JSON(http.StatusBadRequest, utils.GetWarnings())
					return
				}
			} else {
				// DSItem doesn't exist -- post
				var err error
				dbDSInItems[i], err = qsInItemCreate(dbData, dbDSInItem)
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
	// Updating Query Source record
	_, err = direpo.Put(id, dbData)
	if err != nil {
		//fmt.Println("Error E", utils.GetWarnings())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
	} else {
		apiDSItems := make([]models.APIDataIntegrityItem, dsItemCount)
		compactedItems := dbDSInItems[0:dsItemCount]
		for i, dbSIItem := range compactedItems {
			apiDSItems[i] = models.DbToAPIDataIntegrityItem(dbSIItem)
		}
		apiData = models.DbToAPIDataIntegrity(dbData, apiDSItems)

		c.JSON(http.StatusOK, apiData)
	}
}

// DataIntegrityPost handles a POST("/dataIntegrity") request.
func DataIntegrityPost(
	c *gin.Context,
) {
	var apiData models.APIDataIntegrity
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbData, err := models.APIToDbDataIntegrity(apiData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}
	id, insertErr := direpo.Post(dbData)
	if insertErr != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}

	apiData.ID = id
	// Save DSItems with new parent ID
	dbDSItems := make([]models.DbDataIntegrityItem, len(apiData.Items))
	for i, apiSIItem := range apiData.Items {
		if apiSIItem.Type != "delete" {
			dbSIItem, convertErr := models.APIToDbDataIntegrityItem(apiSIItem)
			if convertErr != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
			dbSIItem.DIID = id
			var err error
			dbDSItems[i], err = qsInItemCreate(dbData, dbSIItem)
			if err != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
		}
	}
	for i, dbSIItem := range dbDSItems {
		apiData.Items[i] = models.DbToAPIDataIntegrityItem(dbSIItem)
	}

	c.JSON(http.StatusCreated, apiData)
}

// Support functions

// dataIntegrityDelete deletes a DbDataIntegrity record and all chldren.
func dataIntegrityDelete(
	id int64,
	items []models.DbDataIntegrityItem,
) error {
	fmt.Println("Start dataIntegrityDelete")
	for _, item := range items {
		err := qsInItemDelete(item)
		if err != nil {
			return err
		}
	}
	err := direpo.Delete(id)
	return err
}

// qsInItemCreate creates a DbDataIntegrityItem record.
func qsInItemCreate(
	dbDSInHead models.DbDataIntegrity,
	dbDSInItem models.DbDataIntegrityItem,
) (
	models.DbDataIntegrityItem,
	error,
) {
	itemID, err := diitemrepo.Post(dbDSInItem)
	if err != nil {
		utils.PushWarnings(err.Error())
		return dbDSInItem, err
	}
	dbDSInItem.ID = itemID
	return dbDSInItem, err
}

// qsInItemDelete deletes a DbDataIntegrityItem record.
func qsInItemDelete(
	dbSIItem models.DbDataIntegrityItem,
) error {
	id := dbSIItem.ID
	if id < 0 {
		id = -id
	}
	err := diitemrepo.Delete(id)
	if err != nil {
		return err
	}
	return err
}
