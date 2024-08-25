package models

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

// DbStructIntegrityItem is the database query source out item record.
type DbStructIntegrityItem struct {
	ID           int64
	SIID         int64
	SeqNum       int
	DbTblColName string
	ChangeDate   string
	Type         string
	OldType      string
	Comment      string
	Creator      string
	Modifier     string
	Created      string
	Modified     string
}

// APIStructIntegrityItem is the api query source out item record.
type APIStructIntegrityItem struct {
	ID           int64  `json:"id"`
	SIID         int64  `json:"siId"`
	SeqNum       int    `json:"seqNum"`
	DbTblColName string `json:"dbTblColName"`
	ChangeDate   string `json:"changeDate"`
	Type         string `json:"type"`
	OldType      string `json:"oldType"`
	Comment      string `json:"comment"`
	Creator      string `json:"creator" binding:"required"`
	Modifier     string `json:"modifier" binding:"required"`
	Created      string `json:"created" binding:"required"`
	Modified     string `json:"modified" binding:"required"`
}

// DbStructIntegrity is the database query source out header record.
type DbStructIntegrity struct {
	ID        int64
	DbTblName string
	Creator   string
	Modifier  string
	Created   string
	Modified  string
}

// APIStructIntegrity is the api query source out header record.
type APIStructIntegrity struct {
	ID        int64  `json:"id"`
	DbTblName string `json:"dbTblName" binding:"required"`
	Creator   string `json:"creator" binding:"required"`
	Modifier  string `json:"modifier" binding:"required"`
	Created   string `json:"created" binding:"required"`
	Modified  string `json:"modified" binding:"required"`

	Items []APIStructIntegrityItem `json:"items" binding:"required"`
}

// APIStructIntegrityQueryColumns is the data structure that transfers the
// parameters to the QuerySourceOutPostQueryItems function.
type APIStructIntegrityQueryColumns struct {
	Columns []string `json:"columns" binding:"required"`
}

// Associated Functions

// APIToDbStructIntegrityItem converts an APIStructIntegrityItem record to a
// DbStructIntegrityItem record.
func APIToDbStructIntegrityItem(
	apiSIItem APIStructIntegrityItem,
) (
	DbStructIntegrityItem,
	error,
) {
	var dbSIItem DbStructIntegrityItem
	dbSIItem.ID = apiSIItem.ID
	dbSIItem.SIID = apiSIItem.SIID
	dbSIItem.SeqNum = apiSIItem.SeqNum
	dbSIItem.DbTblColName = apiSIItem.DbTblColName
	dbSIItem.ChangeDate = apiSIItem.ChangeDate
	dbSIItem.Type = apiSIItem.Type
	dbSIItem.OldType = apiSIItem.OldType
	dbSIItem.Comment = apiSIItem.Comment
	dbSIItem.Creator = apiSIItem.Creator
	dbSIItem.Modifier = apiSIItem.Modifier
	dbSIItem.Created = apiSIItem.Created
	dbSIItem.Modified = apiSIItem.Modified
	return dbSIItem, nil
}

// DbToAPIStructIntegrityItem converts a DbStructIntegrityItem record to an
// APIStructIntegrityItem record.
func DbToAPIStructIntegrityItem(
	dbSIItem DbStructIntegrityItem,
) (
	APIStructIntegrityItem,
) {
	var apiSIItem APIStructIntegrityItem
	apiSIItem.ID = dbSIItem.ID
	apiSIItem.SIID = dbSIItem.SIID
	apiSIItem.SeqNum = dbSIItem.SeqNum
	apiSIItem.DbTblColName = dbSIItem.DbTblColName
	apiSIItem.ChangeDate = dbSIItem.ChangeDate
	apiSIItem.Type = dbSIItem.Type
	apiSIItem.OldType = dbSIItem.OldType
	apiSIItem.Comment = dbSIItem.Comment
	apiSIItem.Creator = dbSIItem.Creator
	apiSIItem.Modifier = dbSIItem.Modifier
	apiSIItem.Created = dbSIItem.Created
	apiSIItem.Modified = dbSIItem.Modified
	return apiSIItem
}

// APIToDbStructIntegrity converts an APIStructIntegrity record to a
// DbStructIntegrity record.
func APIToDbStructIntegrity(
	apiDS APIStructIntegrity,
) (
	DbStructIntegrity,
	error,
) {
	var dbDSHead DbStructIntegrity
	dbDSHead.ID = apiDS.ID
	dbDSHead.DbTblName = apiDS.DbTblName
	dbDSHead.Creator = apiDS.Creator
	dbDSHead.Modifier = apiDS.Modifier
	dbDSHead.Created = apiDS.Created
	dbDSHead.Modified = apiDS.Modified
	return dbDSHead, nil
}

// DbToAPIStructIntegrity converts a DbStructIntegrity record to an
// APIStructIntegrity one.
func DbToAPIStructIntegrity(
	dbDSOutHead DbStructIntegrity,
	items []APIStructIntegrityItem,
) (
	APIStructIntegrity,
) {
	var apiDSOut APIStructIntegrity
	apiDSOut.ID = dbDSOutHead.ID
	apiDSOut.DbTblName = dbDSOutHead.DbTblName
	apiDSOut.Creator = dbDSOutHead.Creator
	apiDSOut.Modifier = dbDSOutHead.Modifier
	apiDSOut.Created = dbDSOutHead.Created
	apiDSOut.Modified = dbDSOutHead.Modified
	apiDSOut.Items = items
	return apiDSOut
}
