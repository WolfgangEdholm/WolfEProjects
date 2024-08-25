package controllers

import (
	"fmt"
	//"strconv"

	"net/http"
	"plan-loader/models"
	tsoutitemrepo "plan-loader/repos/tsoutitemrepo"
	tsoutrepo "plan-loader/repos/tsoutrepo"
	"plan-loader/utils"

	"github.com/gin-gonic/gin"
)

// TransSourceOutGetAllItems handles a GET("/transSourceOutItems") request.
// This api should probably be retired.
func TransSourceOutGetAllItems(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := tsoutitemrepo.GetAll()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APITSOutItem, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		apiDataItems[i] = models.DbToAPITSOutItem(dbDataItem)
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// TransSourceOutGetAll handles a GET("/transSourceOut") request.
// Only the DbTSQut header fields are populated.
func TransSourceOutGetAll(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := tsoutrepo.GetAll()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APITSOut, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		apiDataItems[i] = models.DbToAPITSOut(dbDataItem, nil)
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// TransSourceOutGet handles a GET("/transSourceOut/:id") request.
// The record is found based on the given id.
func TransSourceOutGet(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)
	utils.ClearWarnings()
	dbData, err := tsoutrepo.Get(id)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDS := models.DbToAPITSOut(dbData, nil)
	dbDSItems, err := tsoutitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	apiDSItems := make([]models.APITSOutItem, len(dbDSItems))
	for i, dbSIItem := range dbDSItems {
		apiDSItems[i] = models.DbToAPITSOutItem(dbSIItem)
	}
	apiDS.Items = apiDSItems
	c.JSON(http.StatusOK, apiDS)
}

// TransSourceOutGetFromName handles a GET("/transSourceOutName/:name")
// request. The record is found based on the given name (=DbTblName).
func TransSourceOutGetFromName(c *gin.Context) {
	dbTblName := c.Param("name")
	utils.ClearWarnings()
	dbData, err := tsoutrepo.GetFromName(dbTblName)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDS := models.DbToAPITSOut(dbData, nil)
	dbDSItems, err := tsoutitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	fmt.Println("Name Out Data", apiDS)
	apiDSItems := make([]models.APITSOutItem, len(dbDSItems))
	for i, dbSIItem := range dbDSItems {
		apiDSItems[i] = models.DbToAPITSOutItem(dbSIItem)
	}
	apiDS.Items = apiDSItems
	c.JSON(http.StatusOK, apiDS)
}

// TransSourceOutPut handles a PUT("/transSourceOut/:id") request.
// Because there are children, TransSourceOutPut also handles delete requests,
// as a DELETE request doesn't take a structure (so the childred would be
// unknown)
// If the DbTSOut header record is to be deleted, the id variable is negated.
// This function assumes that any DbTSOutItem child records that are to be
// deleted have their original ids negated and new DbTSOutItem records
// have a 0 ID.
func TransSourceOutPut(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)

	var apiData models.APITSOut
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbDSOutItems := make([]models.DbTSOutItem, len(apiData.Items))
	for i, apiSIItem := range apiData.Items {
		var err error
		dbDSOutItems[i], err = models.APIToDbTSOutItem(apiSIItem)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
	}
	dbData, err := models.APIToDbTSOut(apiData)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}

	if id < 0 {
		err := transSourceOutDelete(-id, dbDSOutItems)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
		return
	}

	for i, dbDSOutItem := range dbDSOutItems {
		if dbDSOutItem.ID > 0 {
			// DSItem exists -- put
			_, err := tsoutitemrepo.Put(dbDSOutItem.ID, dbDSOutItem)
			if err != nil {
				//fmt.Println("Error A", utils.GetWarnings())
				c.JSON(http.StatusBadRequest, utils.GetWarnings())
				return
			}
		} else {
			if dbDSOutItem.ID < 0 {
				// DSItem should be deleted
				err := tsOutItemDelete(dbDSOutItem)
				if err != nil {
					//fmt.Println("Error C", utils.GetWarnings())
					c.JSON(http.StatusBadRequest, utils.GetWarnings())
					return
				}
			} else {
				// DSItem doesn't exist -- post
				var err error
				dbDSOutItems[i], err = tsOutItemCreate(dbData, dbDSOutItem)
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
	for index, dbSIItem := range dbDSOutItems {
		if dbSIItem.ID < 0 {
			offset++
		} else {
			dbDSOutItems[index-offset] = dbDSOutItems[index]
		}
	}
	dsItemCount := len(dbDSOutItems) - offset
	// Updating Trans Source record
	_, err = tsoutrepo.Put(id, dbData)
	if err != nil {
		//fmt.Println("Error E", utils.GetWarnings())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
	} else {
		apiDSItems := make([]models.APITSOutItem, dsItemCount)
		compactedItems := dbDSOutItems[0:dsItemCount]
		for i, dbSIItem := range compactedItems {
			apiDSItems[i] = models.DbToAPITSOutItem(dbSIItem)
		}
		apiData = models.DbToAPITSOut(dbData, apiDSItems)

		c.JSON(http.StatusOK, apiData)
	}
}

// TransSourceOutPost handles a POST("/transSourceOut") request.
func TransSourceOutPost(c *gin.Context) {
	var apiData models.APITSOut
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbData, err := models.APIToDbTSOut(apiData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}
	id, insertErr := tsoutrepo.Post(dbData)
	if insertErr != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}

	apiData.ID = id
	// Save DSItems with new parent ID
	dbDSItems := make([]models.DbTSOutItem, len(apiData.Items))
	for i, apiSIItem := range apiData.Items {
		if apiSIItem.ItemKind != "delete" {
			dbSIItem, convertErr := models.APIToDbTSOutItem(apiSIItem)
			if convertErr != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
			dbSIItem.TSID = id
			var err error
			dbDSItems[i], err = tsOutItemCreate(dbData, dbSIItem)
			if err != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
		}
	}
	for i, dbSIItem := range dbDSItems {
		apiData.Items[i] = models.DbToAPITSOutItem(dbSIItem)
	}

	c.JSON(http.StatusCreated, apiData)
}

// TransSourceOutPostTransItems handles a POST("/transSourceOutTransItems")
// request. It returns DbTSOutItem matching the names in the given array of
// dbTblColName names.
// It is a post request even though nothing is written to the database
// so that the trans parameters can be passed in an array.
// This call is used to verify that a trans is current given possible changes
// to the source tables.
func TransSourceOutPostTransItems(c *gin.Context) {
	// id := utils.GetInt64IdFromReqContext(c)
	var apiData models.APITSOutTransItems
	// fmt.Println("Trans Columns", apiData)
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	// columns := make([]string, len(apiData.Columns))
	// for i, dbDataItem := range apiData.Items {
	// 	columns[i] = dbDataItem.DbTblColName
	// }

	if len(apiData.Items) == 0 {
		c.JSON(http.StatusOK, []models.APITSOutItem{})
	} else {
		dbDataItems, err := tsoutitemrepo.GetAllTransItems(apiData.Items)
		if err != nil {
			c.JSON(http.StatusNotFound, utils.GetWarnings())
			return
		}
		apiDataItems := make([]models.APITSOutItem, len(dbDataItems))
		for i, dbDataItem := range dbDataItems {
			apiDataItems[i] = models.DbToAPITSOutItem(dbDataItem)
		}
		c.JSON(http.StatusOK, apiDataItems)
	}
}

// Support functions

// transSourceInDelete deletes a Trans Source Out record and all chldren.
func transSourceOutDelete(id int64, items []models.DbTSOutItem) error {
	fmt.Println("Start transSourceDelete")
	for _, item := range items {
		err := tsOutItemDelete(item)
		if err != nil {
			return err
		}
	}
	err := tsoutrepo.Delete(id)
	return err
}

// qsOutItemCreate creates a Trans Source Out item record DbTSOutItem.
func tsOutItemCreate(
	dbDSOutHead models.DbTSOut, dbDSOutItem models.DbTSOutItem) (
	models.DbTSOutItem, error) {
	itemID, err := tsoutitemrepo.Post(dbDSOutItem)
	if err != nil {
		utils.PushWarnings(err.Error())
		return dbDSOutItem, err
	}
	dbDSOutItem.ID = itemID
	return dbDSOutItem, err
}

// qsOutItemDelete deletes a Trans Source Out item record DbTSOutItem.
func tsOutItemDelete(dbDSOutItem models.DbTSOutItem) error {
	id := dbDSOutItem.ID
	if id < 0 {
		id = -id
	}
	err := tsoutitemrepo.Delete(id)
	if err != nil {
		return err
	}
	return err
}
