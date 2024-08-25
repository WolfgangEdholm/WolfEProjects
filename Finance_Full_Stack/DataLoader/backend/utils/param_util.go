package utils

import (
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
)

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

// GetInt64IdFromReqContext converts c.Param to a 64 bit integer
func GetInt64IdFromReqContext(c *gin.Context) int64 {
	idParam := c.Param("id")
	id, _ := strconv.ParseInt(idParam, 10, 64)

	return id
}

// IDToString converts an ID to a StrID. If ID == 0 "" is returned
func IDToString(id int64) string {
	if id == 0 {
		return ""
	}
	return strconv.FormatInt(id, 10)
}

// StrIDToInt converts a strID to an int64. If strID == "" 0 is returned
func StrIDToInt(strID string, errDesc string) (int64, error) {
	if strID == "" {
		return 0, nil
	}
	id, err := strconv.ParseInt(strID, 10, 64)
	if err != nil {
		PushWarnings(fmt.Sprintf("Error converting %s=%s to integer",
			errDesc, strID))
		return id, err
	}
	return id, nil
}
