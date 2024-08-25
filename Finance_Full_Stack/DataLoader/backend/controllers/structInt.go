package controllers

import (
	"fmt"
	//"strconv"

	"net/http"
	"plan-loader/models"
	siitemrepo "plan-loader/repos/siitemrepo"
	sirepo "plan-loader/repos/sirepo"
	"plan-loader/utils"

	"github.com/gin-gonic/gin"
)

// StructIntegrityGetAllItems handles a GET("/structIntegrityItems") request.
// This api should probably be retired.
func StructIntegrityGetAllItems(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := siitemrepo.GetAll()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APIStructIntegrityItem, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		apiDataItems[i] = models.DbToAPIStructIntegrityItem(dbDataItem)
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// StructIntegrityGetAll handles a GET("/structIntegrity") request.
// Only the DbQSQut header fields are populated.
func StructIntegrityGetAll(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := sirepo.GetAll()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APIStructIntegrity, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		apiDataItems[i] = models.DbToAPIStructIntegrity(dbDataItem, nil)
	}
	c.JSON(http.StatusOK, apiDataItems)
}

// StructIntegrityGet handles a GET("/structIntegrity/:id") request.
// The record is found based on the given id.
func StructIntegrityGet(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)
	utils.ClearWarnings()
	dbData, err := sirepo.Get(id)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDS := models.DbToAPIStructIntegrity(dbData, nil)
	dbDSItems, err := siitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	apiDSItems := make([]models.APIStructIntegrityItem, len(dbDSItems))
	for i, dbSIItem := range dbDSItems {
		apiDSItems[i] = models.DbToAPIStructIntegrityItem(dbSIItem)
	}
	apiDS.Items = apiDSItems
	c.JSON(http.StatusOK, apiDS)
}

// StructIntegrityGetFromName handles a GET("/structIntegrityName/:name")
// request. The record is found based on the given name (=DbTblName).
func StructIntegrityGetFromName(c *gin.Context) {
	dbTblName := c.Param("name")
	utils.ClearWarnings()
	dbData, err := sirepo.GetFromName(dbTblName)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDS := models.DbToAPIStructIntegrity(dbData, nil)
	dbDSItems, err := siitemrepo.GetAllChildren(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	fmt.Println("Name Out Data", apiDS)
	apiDSItems := make([]models.APIStructIntegrityItem, len(dbDSItems))
	for i, dbSIItem := range dbDSItems {
		apiDSItems[i] = models.DbToAPIStructIntegrityItem(dbSIItem)
	}
	apiDS.Items = apiDSItems
	c.JSON(http.StatusOK, apiDS)
}

// StructIntegrityPut handles a PUT("/structIntegrity/:id") request.
// Because there are children, StructIntegrityPut also handles delete requests,
// as a DELETE request doesn't take a structure (so the childred would be
// unknown)
// If the DbStructIntegrity header record is to be deleted, the id variable is negated.
// This function assumes that any DbStructIntegrityItem child records that are to be
// deleted have their original ids negated and new DbStructIntegrityItem records
// have a 0 ID.
func StructIntegrityPut(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)

	var apiData models.APIStructIntegrity
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbDSOutItems := make([]models.DbStructIntegrityItem, len(apiData.Items))
	for i, apiSIItem := range apiData.Items {
		var err error
		dbDSOutItems[i], err = models.APIToDbStructIntegrityItem(apiSIItem)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
	}
	dbData, err := models.APIToDbStructIntegrity(apiData)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}

	if id < 0 {
		err := structIntegrityDelete(-id, dbDSOutItems)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
		return
	}

	for i, dbDSOutItem := range dbDSOutItems {
		if dbDSOutItem.ID > 0 {
			// DSItem exists -- put
			_, err := siitemrepo.Put(dbDSOutItem.ID, dbDSOutItem)
			if err != nil {
				//fmt.Println("Error A", utils.GetWarnings())
				c.JSON(http.StatusBadRequest, utils.GetWarnings())
				return
			}
		} else {
			if dbDSOutItem.ID < 0 {
				// DSItem should be deleted
				err := siOutItemDelete(dbDSOutItem)
				if err != nil {
					//fmt.Println("Error C", utils.GetWarnings())
					c.JSON(http.StatusBadRequest, utils.GetWarnings())
					return
				}
			} else {
				// DSItem doesn't exist -- post
				var err error
				dbDSOutItems[i], err = siOutItemCreate(dbData, dbDSOutItem)
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
	// Updating Query Source record
	_, err = sirepo.Put(id, dbData)
	if err != nil {
		//fmt.Println("Error E", utils.GetWarnings())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
	} else {
		apiDSItems := make([]models.APIStructIntegrityItem, dsItemCount)
		compactedItems := dbDSOutItems[0:dsItemCount]
		for i, dbSIItem := range compactedItems {
			apiDSItems[i] = models.DbToAPIStructIntegrityItem(dbSIItem)
		}
		apiData = models.DbToAPIStructIntegrity(dbData, apiDSItems)

		c.JSON(http.StatusOK, apiData)
	}
}

// StructIntegrityPost handles a POST("/structIntegrity") request.
func StructIntegrityPost(c *gin.Context) {
	var apiData models.APIStructIntegrity
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbData, err := models.APIToDbStructIntegrity(apiData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}
	id, insertErr := sirepo.Post(dbData)
	if insertErr != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}

	apiData.ID = id
	// Save DSItems with new parent ID
	dbDSItems := make([]models.DbStructIntegrityItem, len(apiData.Items))
	for i, apiSIItem := range apiData.Items {
		if apiSIItem.Type != "delete" {
			dbSIItem, convertErr := models.APIToDbStructIntegrityItem(apiSIItem)
			if convertErr != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
			dbSIItem.SIID = id
			var err error
			dbDSItems[i], err = siOutItemCreate(dbData, dbSIItem)
			if err != nil {
				c.JSON(http.StatusInternalServerError, utils.GetWarnings())
				return
			}
		}
	}
	for i, dbSIItem := range dbDSItems {
		apiData.Items[i] = models.DbToAPIStructIntegrityItem(dbSIItem)
	}

	c.JSON(http.StatusCreated, apiData)
}

// StructIntegrityPostQueryItems handles a POST("/structIntegrityQueryItems")
// request. It returns DbStructIntegrityItem matching the names in the given array of
// dbTblColName names.
// It is a post request even though nothing is written to the database
// so that the query parameters can be passed in an array.
// This call is used to verify that a query is current given possible changes
// to the source tables.
func StructIntegrityPostQueryItems(c *gin.Context) {
	// id := utils.GetInt64IdFromReqContext(c)
	var apiData models.APIStructIntegrityQueryColumns
	// fmt.Println("Query Columns", apiData)
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

	if len(apiData.Columns) == 0 {
		c.JSON(http.StatusOK, []models.APIStructIntegrityItem{})
	} else {
		dbDataItems, err := siitemrepo.GetAllQueryItems(apiData.Columns)
		if err != nil {
			c.JSON(http.StatusNotFound, utils.GetWarnings())
			return
		}
		apiDataItems := make([]models.APIStructIntegrityItem, len(dbDataItems))
		for i, dbDataItem := range dbDataItems {
			apiDataItems[i] = models.DbToAPIStructIntegrityItem(dbDataItem)
		}
		c.JSON(http.StatusOK, apiDataItems)
	}
}

// Support functions

// structIntegrityDelete deletes a Query Source Out record and all chldren.
func structIntegrityDelete(id int64, items []models.DbStructIntegrityItem) error {
	fmt.Println("Start structIntegrityDelete")
	for _, item := range items {
		err := siOutItemDelete(item)
		if err != nil {
			return err
		}
	}
	err := sirepo.Delete(id)
	return err
}

// siOutItemCreate creates a Query Source Out item record DbStructIntegrityItem.
func siOutItemCreate(
	dbDSOutHead models.DbStructIntegrity, dbDSOutItem models.DbStructIntegrityItem) (
	models.DbStructIntegrityItem, error) {
	itemID, err := siitemrepo.Post(dbDSOutItem)
	if err != nil {
		utils.PushWarnings(err.Error())
		return dbDSOutItem, err
	}
	dbDSOutItem.ID = itemID
	return dbDSOutItem, err
}

// siOutItemDelete deletes a Query Source Out item record DbStructIntegrityItem.
func siOutItemDelete(dbDSOutItem models.DbStructIntegrityItem) error {
	id := dbDSOutItem.ID
	if id < 0 {
		id = -id
	}
	err := siitemrepo.Delete(id)
	if err != nil {
		return err
	}
	return err
}
