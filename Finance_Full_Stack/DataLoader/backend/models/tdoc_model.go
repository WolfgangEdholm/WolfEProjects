package models

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

// DbTransDocItem is the database transformer documnet item record.
type DbTransDocItem struct {
	ID       int64
	TransID  int64
	SeqNum   int
	ItemKind string
	ItemName string
	Param1   string
	Param2   string
	Creator  string
	Modifier string
	Created  string
	Modified string
}

// APITransDocItem is the api transformer documnet item record.
type APITransDocItem struct {
	ID       int64  `json:"id"`
	TransID  int64  `json:"transId"`
	SeqNum   int    `json:"seqNum"`
	ItemKind string `json:"itemKind" binding:"required"`
	ItemName string `json:"itemName"`
	Param1   string `json:"param1"`
	Param2   string `json:"param2"`
	Creator  string `json:"creator" binding:"required"`
	Modifier string `json:"modifier" binding:"required"`
	Created  string `json:"created" binding:"required"`
	Modified string `json:"modified" binding:"required"`
}

// DbTransDoc is the database transformer documnet head record.
type DbTransDoc struct {
	ID                int64
	DbTransName       string
	OkDate            string
	Creator           string
	Modifier          string
	Created           string
	Modified          string
}

// APITransDoc is the api transformer documnet head record.
type APITransDoc struct {
	ID          			int64  `json:"id"`
	DbTransName 			string `json:"dbTransName" binding:"required"`
	// This field will not be saved
	OldDbTransName 		string `json:"oldDbTransName" binding:"required"`
	OkDate         		string `json:"okDate" binding:"required"`
	Creator           string `json:"creator" binding:"required"`
	Modifier          string `json:"modifier" binding:"required"`
	Created           string `json:"created" binding:"required"`
	Modified          string `json:"modified" binding:"required"`

	Items []APITransDocItem `json:"items" binding:"required"`
}

// Associated Functions

// APIToDbTransDocItem converts an APITransDocItem record to
// a DbTransDocItem one.
func APIToDbTransDocItem(apiDocItem APITransDocItem) (DbTransDocItem, error) {
	var dbDocItem DbTransDocItem
	dbDocItem.ID = apiDocItem.ID
	dbDocItem.TransID = apiDocItem.TransID
	dbDocItem.SeqNum = apiDocItem.SeqNum
	dbDocItem.ItemKind = apiDocItem.ItemKind
	dbDocItem.ItemName = apiDocItem.ItemName
	dbDocItem.Param1 = apiDocItem.Param1
	dbDocItem.Param2 = apiDocItem.Param2
	dbDocItem.Creator = apiDocItem.Creator
	dbDocItem.Modifier = apiDocItem.Modifier
	dbDocItem.Created = apiDocItem.Created
	dbDocItem.Modified = apiDocItem.Modified
	return dbDocItem, nil
}

// DbToAPITransDocItem converts a DbTransDocItem record to
// an APITransDocItem one.
func DbToAPITransDocItem(dbDocItem DbTransDocItem) APITransDocItem {
	var apiDocItem APITransDocItem
	apiDocItem.ID = dbDocItem.ID
	apiDocItem.TransID = dbDocItem.TransID
	apiDocItem.SeqNum = dbDocItem.SeqNum
	apiDocItem.ItemKind = dbDocItem.ItemKind
	apiDocItem.ItemName = dbDocItem.ItemName
	apiDocItem.Param1 = dbDocItem.Param1
	apiDocItem.Param2 = dbDocItem.Param2
	apiDocItem.Creator = dbDocItem.Creator
	apiDocItem.Modifier = dbDocItem.Modifier
	apiDocItem.Created = dbDocItem.Created
	apiDocItem.Modified = dbDocItem.Modified
	return apiDocItem
}

// APIToDbTransDoc converts an APITransDoc record to a DbTransDoc one.
func APIToDbTransDoc(apiDoc APITransDoc) (DbTransDoc, error) {
	var dbDoc DbTransDoc
	dbDoc.ID = apiDoc.ID
	dbDoc.DbTransName = apiDoc.DbTransName
	dbDoc.OkDate = apiDoc.OkDate
	dbDoc.Creator = apiDoc.Creator
	dbDoc.Modifier = apiDoc.Modifier
	dbDoc.Created = apiDoc.Created
	dbDoc.Modified = apiDoc.Modified
	return dbDoc, nil
}

// DbToAPITransDoc converts a DbTransDoc record to an ApiTransDoc one.
func DbToAPITransDoc(dbDoc DbTransDoc, items []APITransDocItem) APITransDoc {
	var apiDoc APITransDoc
	apiDoc.ID = dbDoc.ID
	apiDoc.DbTransName = dbDoc.DbTransName
	apiDoc.OldDbTransName = ""
	apiDoc.OkDate = dbDoc.OkDate
	apiDoc.Creator = dbDoc.Creator
	apiDoc.Modifier = dbDoc.Modifier
	apiDoc.Created = dbDoc.Created
	apiDoc.Modified = dbDoc.Modified
	apiDoc.Items = items
	return apiDoc
}
