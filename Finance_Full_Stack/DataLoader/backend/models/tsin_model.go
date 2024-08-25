package models

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

// DbTransItegrityCheckItem is the datbase record receiving a
// transformer integrity query.
type DbTransItegrityCheckItem struct {
	ID             int64
	TSID           int64
	DbTransName    string
	ItemName  		 string
	DbItemName     string
	ItemKind       string
	ChangeDate     string
	FixDate        string
	OkDate         string
	Creator        string
	Modifier       string
	Created        string
	Modified       string
}

// APITransItegrityCheckItem is the api record interfacing a
// transformer integrity query.
type APITransItegrityCheckItem struct {
	ID             int64  `json:"id"`
	TSID           int64  `json:"tsId"`
	DbTransName    string `json:"dbTransName"`
	ItemName       string `json:"itemName"`
	DbItemName     string `json:"dbItemName"`
	ItemKind       string `json:"itemKind"`
	ChangeDate     string `json:"changeDate"`
	FixDate        string `json:"fixDate"`
	OkDate         string `json:"okDate"`
	Creator        string `json:"creator" binding:"required"`
	Modifier       string `json:"modifier" binding:"required"`
	Created        string `json:"created" binding:"required"`
	Modified       string `json:"modified" binding:"required"`
}

// DbTSInItem is the database transformer source in item record.
type DbTSInItem struct {
	ID             int64
	TSID           int64
	SeqNum         int
	DbTransName    string
	ItemName       string
	DbItemName     string
	ItemKind       string
	FixDate        string
	Creator        string
	Modifier       string
	Created        string
	Modified       string
}

// APITSInItem is the api transformer source in item record.
type APITSInItem struct {
	ID             int64  `json:"id"`
	TSID           int64  `json:"tsId"`
	SeqNum         int    `json:"seqNum"`
	DbTransName    string `json:"dbTransName"`
	ItemName       string `json:"itemName"`
	DbItemName     string `json:"dbItemName"`
	ItemKind       string `json:"itemKind"`
	FixDate        string `json:"fixDate"`
	Creator        string `json:"creator" binding:"required"`
	Modifier       string `json:"modifier" binding:"required"`
	Created        string `json:"created" binding:"required"`
	Modified       string `json:"modified" binding:"required"`
}

// DbTSIn is the database transformer source in header record.
type DbTSIn struct {
	ID          int64
	DbTransName string
	OkDate      string
	Creator     string
	Modifier    string
	Created     string
	Modified    string
}

// APITSIn is the api transformer source in header record.
type APITSIn struct {
	ID          int64  `json:"id"`
	DbTransName string `json:"dbTransName" binding:"required"`
	OkDate      string `json:"okDate" binding:"required"`
	Creator     string `json:"creator" binding:"required"`
	Modifier    string `json:"modifier" binding:"required"`
	Created     string `json:"created" binding:"required"`
	Modified    string `json:"modified" binding:"required"`

	Items []APITSInItem `json:"items" binding:"required"`
}

// Associated Functions

// APIToDbTransItegrityCheckItem converts an APITransItegrityCheckItem
// record to a DbTransItegrityCheckItem one.
func APIToDbTransItegrityCheckItem(
	apiIntegrityItem APITransItegrityCheckItem) (DbTransItegrityCheckItem, error) {
	var dbIntegrityItem DbTransItegrityCheckItem
	dbIntegrityItem.ID = apiIntegrityItem.ID
	dbIntegrityItem.TSID = apiIntegrityItem.TSID
	dbIntegrityItem.DbTransName = apiIntegrityItem.DbTransName
	dbIntegrityItem.ItemName = apiIntegrityItem.ItemName
	dbIntegrityItem.DbItemName = apiIntegrityItem.DbItemName
	dbIntegrityItem.ItemKind = apiIntegrityItem.ItemKind
	dbIntegrityItem.ChangeDate = apiIntegrityItem.ChangeDate
	dbIntegrityItem.FixDate = apiIntegrityItem.FixDate
	dbIntegrityItem.OkDate = apiIntegrityItem.OkDate
	dbIntegrityItem.Creator = apiIntegrityItem.Creator
	dbIntegrityItem.Modifier = apiIntegrityItem.Modifier
	dbIntegrityItem.Created = apiIntegrityItem.Created
	dbIntegrityItem.Modified = apiIntegrityItem.Modified
	return dbIntegrityItem, nil
}

// DbToAPITransItegrityCheckItem converts a DbTransItegrityCheckItem
// record to an APITransItegrityCheckItem one.
func DbToAPITransItegrityCheckItem(
	dbIntegrityItem DbTransItegrityCheckItem) APITransItegrityCheckItem {
	var apiIntegrityItem APITransItegrityCheckItem
	apiIntegrityItem.ID = dbIntegrityItem.ID
	apiIntegrityItem.TSID = dbIntegrityItem.TSID
	apiIntegrityItem.DbTransName = dbIntegrityItem.DbTransName
	apiIntegrityItem.ItemName = dbIntegrityItem.ItemName
	apiIntegrityItem.DbItemName = dbIntegrityItem.DbItemName
	apiIntegrityItem.ItemName = dbIntegrityItem.ItemName
	apiIntegrityItem.ChangeDate = dbIntegrityItem.ChangeDate
	apiIntegrityItem.FixDate = dbIntegrityItem.FixDate
	apiIntegrityItem.OkDate = dbIntegrityItem.OkDate
	apiIntegrityItem.Creator = dbIntegrityItem.Creator
	apiIntegrityItem.Modifier = dbIntegrityItem.Modifier
	apiIntegrityItem.Created = dbIntegrityItem.Created
	apiIntegrityItem.Modified = dbIntegrityItem.Modified
	return apiIntegrityItem
}

// APIToDbTSInItem converts an APIDSItem record to a DbDSItem one.
func APIToDbTSInItem(apiTSInItem APITSInItem) (DbTSInItem, error) {
	var dbTSInItem DbTSInItem
	dbTSInItem.ID = apiTSInItem.ID
	dbTSInItem.TSID = apiTSInItem.TSID
	dbTSInItem.SeqNum = apiTSInItem.SeqNum
	dbTSInItem.DbTransName = apiTSInItem.DbTransName
	dbTSInItem.ItemName = apiTSInItem.ItemName
	dbTSInItem.DbItemName = apiTSInItem.DbItemName
	dbTSInItem.ItemKind = apiTSInItem.ItemKind
	dbTSInItem.FixDate = apiTSInItem.FixDate
	dbTSInItem.Creator = apiTSInItem.Creator
	dbTSInItem.Modifier = apiTSInItem.Modifier
	dbTSInItem.Created = apiTSInItem.Created
	dbTSInItem.Modified = apiTSInItem.Modified
	return dbTSInItem, nil
}

// DbToAPITSInItem converts a DbDSItem record to an ApiDSItem one.
func DbToAPITSInItem(dbTSInItem DbTSInItem) APITSInItem {
	var apiTSInItem APITSInItem
	apiTSInItem.ID = dbTSInItem.ID
	apiTSInItem.TSID = dbTSInItem.TSID
	apiTSInItem.SeqNum = dbTSInItem.SeqNum
	apiTSInItem.DbTransName = dbTSInItem.DbTransName
	apiTSInItem.ItemName = dbTSInItem.ItemName
	apiTSInItem.DbItemName = dbTSInItem.DbItemName
	apiTSInItem.ItemKind = dbTSInItem.ItemKind
	apiTSInItem.FixDate = dbTSInItem.FixDate
	apiTSInItem.Creator = dbTSInItem.Creator
	apiTSInItem.Modifier = dbTSInItem.Modifier
	apiTSInItem.Created = dbTSInItem.Created
	apiTSInItem.Modified = dbTSInItem.Modified
	return apiTSInItem
}

// APIToDbTSIn converts an APITSIn record to a DbTSIn one.
func APIToDbTSIn(apiTSIn APITSIn) (DbTSIn, error) {
	var dbTSIn DbTSIn
	dbTSIn.ID = apiTSIn.ID
	dbTSIn.DbTransName = apiTSIn.DbTransName
	dbTSIn.OkDate = apiTSIn.OkDate
	dbTSIn.Creator = apiTSIn.Creator
	dbTSIn.Modifier = apiTSIn.Modifier
	dbTSIn.Created = apiTSIn.Created
	dbTSIn.Modified = apiTSIn.Modified
	return dbTSIn, nil
}

// DbToAPITSIn converts a DbTSIn record to an APITSIn one.
func DbToAPITSIn(dbTSIn DbTSIn, items []APITSInItem) APITSIn {
	var apiTSIn APITSIn
	apiTSIn.ID = dbTSIn.ID
	apiTSIn.DbTransName = dbTSIn.DbTransName
	apiTSIn.OkDate = dbTSIn.OkDate
	apiTSIn.Creator = dbTSIn.Creator
	apiTSIn.Modifier = dbTSIn.Modifier
	apiTSIn.Created = dbTSIn.Created
	apiTSIn.Modified = dbTSIn.Modified
	apiTSIn.Items = items
	return apiTSIn
}
