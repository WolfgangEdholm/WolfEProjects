package models

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

// DbTSOutItem is the database transformer source out item record.
type DbTSOutItem struct {
	ID            int64
	TSID          int64
	SeqNum        int
	DbTransItem 	string
	ChangeDate    string
	ItemKind      string
	Comment       string
	Creator       string
	Modifier      string
	Created       string
	Modified      string
}

// APITSOutItem is the api transformer source out item record.
type APITSOutItem struct {
	ID            int64  `json:"id"`
	TSID          int64  `json:"tsId"`
	SeqNum        int    `json:"seqNum"`
	DbTransItem   string `json:"dbTransItem"`
	ChangeDate    string `json:"changeDate"`
	ItemKind      string `json:"itemKind"`
	Comment       string `json:"comment"`
	Creator       string `json:"creator" binding:"required"`
	Modifier      string `json:"modifier" binding:"required"`
	Created       string `json:"created" binding:"required"`
	Modified      string `json:"modified" binding:"required"`
}

// DbTSOut is the database transformer source out header record.
type DbTSOut struct {
	ID           int64
	DbTransName  string
	Creator      string
	Modifier     string
	Created      string
	Modified     string
}

// APITSOut is the the api transformer source out header record.
type APITSOut struct {
	ID           int64  `json:"id"`
	DbTransName  string `json:"dbTransName" binding:"required"`
	Creator      string `json:"creator" binding:"required"`
	Modifier     string `json:"modifier" binding:"required"`
	Created      string `json:"created" binding:"required"`
	Modified     string `json:"modified" binding:"required"`

	Items []APITSOutItem `json:"items" binding:"required"`
}


// APITSOutTransItems is the data structure that transfers the
// parameters to the TransSourceOutPostTransItems function.
type APITSOutTransItems struct {
	Items []string `json:"items" binding:"required"`
}

// Associated Functions

// APIToDbTSOutItem converts an APITSOutItem record to a DbTSOutItem one.
func APIToDbTSOutItem(apiTSOutItem APITSOutItem) (DbTSOutItem, error) {
	var dbTSOutItem DbTSOutItem
	dbTSOutItem.ID = apiTSOutItem.ID
	dbTSOutItem.TSID = apiTSOutItem.TSID
	dbTSOutItem.SeqNum = apiTSOutItem.SeqNum
	dbTSOutItem.DbTransItem = apiTSOutItem.DbTransItem
	dbTSOutItem.ChangeDate = apiTSOutItem.ChangeDate
	dbTSOutItem.ItemKind = apiTSOutItem.ItemKind
	dbTSOutItem.Comment = apiTSOutItem.Comment
	dbTSOutItem.Creator = apiTSOutItem.Creator
	dbTSOutItem.Modifier = apiTSOutItem.Modifier
	dbTSOutItem.Created = apiTSOutItem.Created
	dbTSOutItem.Modified = apiTSOutItem.Modified
	return dbTSOutItem, nil
}

// DbToAPITSOutItem converts a DbTSOutItem record to an ApiTSOutItem one.
func DbToAPITSOutItem(dbTSOutItem DbTSOutItem) APITSOutItem {
	var apiTSOutItem APITSOutItem
	apiTSOutItem.ID = dbTSOutItem.ID
	apiTSOutItem.TSID = dbTSOutItem.TSID
	apiTSOutItem.SeqNum = dbTSOutItem.SeqNum
	apiTSOutItem.DbTransItem = dbTSOutItem.DbTransItem
	apiTSOutItem.ChangeDate = dbTSOutItem.ChangeDate
	apiTSOutItem.ItemKind = dbTSOutItem.ItemKind
	apiTSOutItem.Comment = dbTSOutItem.Comment
	apiTSOutItem.Creator = dbTSOutItem.Creator
	apiTSOutItem.Modifier = dbTSOutItem.Modifier
	apiTSOutItem.Created = dbTSOutItem.Created
	apiTSOutItem.Modified = dbTSOutItem.Modified
	return apiTSOutItem
}

// APIToDbTSOut converts an APITSOut record to a DbTSOut one.
func APIToDbTSOut(apiTSOut APITSOut) (DbTSOut, error) {
	var dbTSOut DbTSOut
	dbTSOut.ID = apiTSOut.ID
	dbTSOut.DbTransName = apiTSOut.DbTransName
	dbTSOut.Creator = apiTSOut.Creator
	dbTSOut.Modifier = apiTSOut.Modifier
	dbTSOut.Created = apiTSOut.Created
	dbTSOut.Modified = apiTSOut.Modified
	return dbTSOut, nil
}

// DbToAPITSOut converts a DbTSOut record to an APITSOut one.
func DbToAPITSOut(dbTSOut DbTSOut, items []APITSOutItem) APITSOut {
	var apiDSOut APITSOut
	apiDSOut.ID = dbTSOut.ID
	apiDSOut.DbTransName = dbTSOut.DbTransName
	apiDSOut.Creator = dbTSOut.Creator
	apiDSOut.Modifier = dbTSOut.Modifier
	apiDSOut.Created = dbTSOut.Created
	apiDSOut.Modified = dbTSOut.Modified
	apiDSOut.Items = items
	return apiDSOut
}
