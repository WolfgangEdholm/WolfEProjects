package controllers

import (
	"fmt"
	//"strconv"

	"net/http"
	"plan-loader/models"
	"plan-loader/repos/positionrepo"
	"plan-loader/repos/segmentrepo"
	"plan-loader/utils"

	"github.com/gin-gonic/gin"
)

// SegmentGetAll handles a GET:id segment request.
func SegmentGetAll(c *gin.Context) {
	utils.ClearWarnings()
	dbDataItems, err := segmentrepo.GetAll()
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiDataItems := make([]models.APISegment, len(dbDataItems))
	for i, dbDataItem := range dbDataItems {
		apiDataItems[i] = models.DbToAPISegment(dbDataItem, nil)
		dbPositionItems, err := positionrepo.GetAll(dbDataItem.ID)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
		apiPositionItems := make([]models.APIPosition, len(dbPositionItems))
		for j, dbPosition := range dbPositionItems {
			apiPositionItems[j] = models.DbToAPIPosition(dbPosition)
		}
		apiDataItems[i].Positions = apiPositionItems

	}
	// for row := 0; row < len(dataItems); row++ {
	// 	apiDataItems[row] = dbToAPISegment(dbDataItems[row], nil)
	// 	dbPositionItems, err := positionrepo.GetAll(dataItems[row].ID)
	// 	if err != nil {
	// 		c.JSON(http.StatusBadRequest, utils.GetWarnings())
	// 		return
	// 	}
	// 	apiSegments[row].Positions = positionItems
	// }

	c.JSON(http.StatusOK, apiDataItems)
}

// SegmentGet handles a GET:id segment request.
func SegmentGet(c *gin.Context) {
	id := utils.GetInt64IdFromReqContext(c)
	utils.ClearWarnings()
	dbData, err := segmentrepo.Get(id)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.GetWarnings())
		return
	}
	apiSegment := models.DbToAPISegment(dbData, nil)
	dbPositionItems, err := positionrepo.GetAll(dbData.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	apiPositionItems := make([]models.APIPosition, len(dbPositionItems))
	for i, dbPosition := range dbPositionItems {
		apiPositionItems[i] = models.DbToAPIPosition(dbPosition)
	}
	apiSegment.Positions = apiPositionItems
	c.JSON(http.StatusOK, apiSegment)
}

// SegmentPut handles a PUT:id segment request.
// This function assumes that positions that are to be deleted
// have their original ID negated and new positions have a 0 ID.
func SegmentPut(c *gin.Context) {
	fmt.Println("Start SegmentPut")
	id := utils.GetInt64IdFromReqContext(c)

	var apiData models.APISegment
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbPositionItems := make([]models.DbPosition, len(apiData.Positions))
	for i, apiPosition := range apiData.Positions {
		var err error
		dbPositionItems[i], err = models.APIToDbPosition(apiPosition)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
	}
	dbData, err := models.APIToDbSegment(apiData)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}

	if id < 0 {
		err := segmentDelete(-id, dbPositionItems)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
		return
	}

	for i, dbPosition := range dbPositionItems {
		if dbPosition.ID > 0 {
			// Position exists -- put
			_, err := positionrepo.Put(dbPosition.ID, dbPosition)
			if err != nil {
				//fmt.Println("Error A", utils.GetWarnings())
				c.JSON(http.StatusBadRequest, utils.GetWarnings())
				return
			}
			if dbPosition.SiblingID > 0 {
				err = segmentrepo.UpdateSegmentSibling(dbPosition.SiblingID,
					dbPosition.Name, dbPosition.ID)
				if err != nil {
					//fmt.Println("Error B", utils.GetWarnings())
					c.JSON(http.StatusBadRequest, utils.GetWarnings())
					return
				}
			}
		} else {
			if dbPosition.ID < 0 {
				// Position should be deleted
				err := deletePosition(dbPosition)
				if err != nil {
					//fmt.Println("Error C", utils.GetWarnings())
					c.JSON(http.StatusBadRequest, utils.GetWarnings())
					return
				}
			} else {
				// Position doesn't exist -- post
				var err error
				dbPositionItems[i], err = createPosition(dbData, dbPosition)
				if err != nil {
					//fmt.Println("Error D", utils.GetWarnings())
					c.JSON(http.StatusBadRequest, utils.GetWarnings())
					return
				}
			}
		}
	}
	// Remove deleted positions
	offset := 0
	for index, dbPosition := range dbPositionItems {
		if dbPosition.ID < 0 {
			offset++
		} else {
			dbPositionItems[index-offset] = dbPositionItems[index]
		}
	}
	positionCount := len(dbPositionItems) - offset
	if dbData.SiblingID > 0 {
		err := positionrepo.UpdatePositionSibling(dbData.SiblingID, dbData.Name, 0)
		if err != nil {
			c.JSON(http.StatusBadRequest, utils.GetWarnings())
			return
		}
	}
	// Updating segment
	_, err = segmentrepo.Put(id, dbData)
	if err != nil {
		//fmt.Println("Error E", utils.GetWarnings())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
	} else {
		apiPositions := make([]models.APIPosition, positionCount)
		for i, dbPosition := range dbPositionItems {
			apiPositions[i] = models.DbToAPIPosition(dbPosition)
		}
		apiData = models.DbToAPISegment(dbData, apiPositions)

		c.JSON(http.StatusOK, apiData)
	}
}

// SegmentPost handles a POST segment request.
func SegmentPost(c *gin.Context) {
	var apiData models.APISegment
	utils.ClearWarnings()
	bindErr := c.BindJSON(&apiData)
	if bindErr != nil {
		utils.PushWarnings(bindErr.Error())
		c.JSON(http.StatusBadRequest, utils.GetWarnings())
		return
	}
	dbData, err := models.APIToDbSegment(apiData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}
	id, insertErr := segmentrepo.Post(dbData)
	if insertErr != nil {
		c.JSON(http.StatusInternalServerError, utils.GetWarnings())
		return
	}

	apiData.ID = id
	// Save positions with new parent ID
	dbPositions := make([]models.DbPosition, len(apiData.Positions))
	for i, apiPosition := range apiData.Positions {
		dbPosition, convertErr := models.APIToDbPosition(apiPosition)
		if convertErr != nil {
			c.JSON(http.StatusInternalServerError, utils.GetWarnings())
			return
		}
		dbPosition.SegmentID = id
		var err error
		dbPositions[i], err = createPosition(dbData, dbPosition)
		if err != nil {
			c.JSON(http.StatusInternalServerError, utils.GetWarnings())
			return
		}
	}
	for i, dbPosition := range dbPositions {
		apiData.Positions[i] = models.DbToAPIPosition(dbPosition)
	}
	c.JSON(http.StatusCreated, apiData)
}

// Support functions

// segmentDelete handles a DETELTE:id segment request.
func segmentDelete(id int64, positions []models.DbPosition) error {
	fmt.Println("Start segmentDelete")
	for _, position := range positions {
		err := deletePosition(position)
		if err != nil {
			return err
		}
	}
	err := segmentrepo.Delete(id)
	return err
}

func createPosition(dbSegment models.DbSegment, dbPosition models.DbPosition) (
	models.DbPosition, error) {
	posID, err := positionrepo.Post(dbPosition)
	if err != nil {
		utils.PushWarnings(err.Error())
		return dbPosition, err
	}
	dbPosition.ID = posID
	if dbSegment.Type == models.DbSegmentTypeSuper {
		// Create sibling Segment record
		segmentID, cerr := segmentrepo.CreateSegmentSibling(dbPosition)
		if cerr != nil {
			utils.PushWarnings(err.Error())
			return dbPosition, cerr
		}
		err = positionrepo.UpdatePositionSibling(posID, "", segmentID)
		if err != nil {
			utils.PushWarnings(err.Error())
		}
		//return dbPosition, err
	}
	return dbPosition, err
}

func deletePosition(dbPosition models.DbPosition) error {
	if dbPosition.SiblingID > 0 {
		// There is a sibling record. Remove it.
		err := segmentrepo.Delete(dbPosition.SiblingID)
		if err != nil {
			utils.PushWarnings(err.Error())
			return err
		}
	}
	if dbPosition.ID < 0 {
		dbPosition.ID = -dbPosition.ID
	}
	derr := positionrepo.Delete(dbPosition.ID)
	// if derr != nil {
	// 	return err
	// }
	return derr
}
