package models

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

// DbQueryDocItem is the database query documnet item record.
type DbQueryDocItem struct {
	ID       int64
	QueryID  int64
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

// APIQueryDocItem is the api query documnet item record.
type APIQueryDocItem struct {
	ID       int64  `json:"id"`
	QueryID  int64  `json:"queryId"`
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

// DbQueryDoc is the database query documnet head record.
type DbQueryDoc struct {
	ID                int64
	DbQueryName       string
	OkDate            string
	OutputIsTemporary bool
	Creator           string
	Modifier          string
	Created           string
	Modified          string
}

// APIQueryDoc is the api query documnet head record.
type APIQueryDoc struct {
	ID          			int64  `json:"id"`
	DbQueryName 			string `json:"dbQueryName" binding:"required"`
	// This field will not be saved
	OldDbQueryName 		string `json:"oldDbQueryName" binding:"required"`
	OkDate         		string `json:"okDate" binding:"required"`
	// OutputIsTemporary bool`json:"outputIsTemporary" binding:"required"`
	// think of 'required' as non-default (default is 'false')
	// removing 'required' makes it possible to specify 'false' as a useful value
	OutputIsTemporary bool   `json:"outputIsTemporary"`
	Creator           string `json:"creator" binding:"required"`
	Modifier          string `json:"modifier" binding:"required"`
	Created           string `json:"created" binding:"required"`
	Modified          string `json:"modified" binding:"required"`

	Items []APIQueryDocItem `json:"items" binding:"required"`
}

// Associated Functions

// APIToDbQueryDocItem converts an APIQueryDocItem record to
// a DbQueryDocItem one.
func APIToDbQueryDocItem(apiDocItem APIQueryDocItem) (DbQueryDocItem, error) {
	var dbDocItem DbQueryDocItem
	dbDocItem.ID = apiDocItem.ID
	dbDocItem.QueryID = apiDocItem.QueryID
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

// DbToAPIQueryDocItem converts a DbQueryDocItem record to
// aa APIQueryDocItem one.
func DbToAPIQueryDocItem(dbDocItem DbQueryDocItem) APIQueryDocItem {
	var apiDocItem APIQueryDocItem
	apiDocItem.ID = dbDocItem.ID
	apiDocItem.QueryID = dbDocItem.QueryID
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

// APIToDbQueryDoc converts an APIQueryDoc record to a DbQueryDoc one.
func APIToDbQueryDoc(apiDoc APIQueryDoc) (DbQueryDoc, error) {
	var dbDoc DbQueryDoc
	dbDoc.ID = apiDoc.ID
	dbDoc.DbQueryName = apiDoc.DbQueryName
	dbDoc.OkDate = apiDoc.OkDate
	dbDoc.OutputIsTemporary = apiDoc.OutputIsTemporary
	dbDoc.Creator = apiDoc.Creator
	dbDoc.Modifier = apiDoc.Modifier
	dbDoc.Created = apiDoc.Created
	dbDoc.Modified = apiDoc.Modified
	return dbDoc, nil
}

// DbToAPIQueryDoc converts a DbQueryDoc record to an APIQueryDoc one.
func DbToAPIQueryDoc(dbDoc DbQueryDoc, items []APIQueryDocItem) APIQueryDoc {
	var apiDoc APIQueryDoc
	apiDoc.ID = dbDoc.ID
	apiDoc.DbQueryName = dbDoc.DbQueryName
	apiDoc.OldDbQueryName = ""
	apiDoc.OkDate = dbDoc.OkDate
	apiDoc.OutputIsTemporary = dbDoc.OutputIsTemporary
	apiDoc.Creator = dbDoc.Creator
	apiDoc.Modifier = dbDoc.Modifier
	apiDoc.Created = dbDoc.Created
	apiDoc.Modified = dbDoc.Modified
	apiDoc.Items = items
	return apiDoc
}
