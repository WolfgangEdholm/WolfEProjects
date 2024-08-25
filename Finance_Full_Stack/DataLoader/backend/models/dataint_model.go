package models

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

// DbQueryItegrityCheckItem is the query object receiving a Query IntegrityItem
// query.
type DbQueryItegrityCheckItem struct {
	ID              int64
	DIID            int64
	DbQueryName     string
	RequestColumn   string
	DbTblColSource  string
	Type            string
	ChangeDate      string
	FixDate         string
	OkDate          string
	Creator         string
	Modifier        string
	Created         string
	Modified        string
}

// APIQueryItegrityCheckItem is the api object receiving a Query IntegrityItem
// query.
type APIQueryItegrityCheckItem struct {
	ID              int64  `json:"id"`
	DIID            int64  `json:"diId"`
	DbQueryName     string `json:"dbQueryName"`
	RequestColumn   string `json:"requestColumn"`
	DbTblColSource  string `json:"dbTblColSource"`
	Type            string `json:"type"`
	ChangeDate      string `json:"changeDate"`
	FixDate         string `json:"fixDate"`
	OkDate          string `json:"okDate"`
	Creator         string `json:"creator" binding:"required"`
	Modifier        string `json:"modifier" binding:"required"`
	Created         string `json:"created" binding:"required"`
	Modified        string `json:"modified" binding:"required"`
}

// DbDataIntegrityItem is the database object representing data integrity item.
type DbDataIntegrityItem struct {
	ID							int64
	DIID            int64
	SeqNum          int
	DbTblName     	string
	ColName		 			string
	DbTblColSource  string
	Type            string
	FixDate         string
	OutOfSyncDate   string
	Creator         string
	Modifier        string
	Created         string
	Modified        string
}

// APIDataIntegrityItem is the api object representing a data integrity item.
type APIDataIntegrityItem struct {
	ID							int64  `json:"id"`
	DIID            int64  `json:"diId"`
	SeqNum          int    `json:"seqNum"`
	DbTblName  		  string `json:"dbTblName"`
	ColName					string `json:"colName"`
	DbTblColSource  string `json:"dbTblColSource"`
	Type            string `json:"type"`
	FixDate         string `json:"fixDate"`
	OutOfSyncDate   string `json:"outOfSyncDate"`
	Creator         string `json:"creator" binding:"required"`
	Modifier        string `json:"modifier" binding:"required"`
	Created         string `json:"created" binding:"required"`
	Modified        string `json:"modified" binding:"required"`
}

// DbDataIntegrity is the database object representing a data integrity record.
type DbDataIntegrity struct {
	ID          		int64
	DbTblName   		string
	OutOfSyncDate   string
	RunDate					string
	Creator     		string
	Modifier    		string
	Created     		string
	Modified    		string
}

// APIDataIntegrity is the api object representing a data integrity record.
type APIDataIntegrity struct {
	ID          		int64  `json:"id"`
	DbTblName   		string `json:"dbTblName" binding:"required"`
	OutOfSyncDate	  string `json:"outOfSyncDate"`
	RunDate     		string `json:"runDate" binding:"required"`
	Creator     		string `json:"creator" binding:"required"`
	Modifier    		string `json:"modifier" binding:"required"`
	Created     		string `json:"created" binding:"required"`
	Modified    		string `json:"modified" binding:"required"`

	Items []APIDataIntegrityItem `json:"items" binding:"required"`
}

// Associated Functions

// APIToDbQueryItegrityCheckItem converts an APIDSItemItegrity record to a
// DbDSItemItegrity record.
func APIToDbQueryItegrityCheckItem(
	apiQICItem APIQueryItegrityCheckItem,
) (
	DbQueryItegrityCheckItem,
	error,
) {
	var dbQICItem DbQueryItegrityCheckItem
	dbQICItem.ID = apiQICItem.ID
	dbQICItem.DIID = apiQICItem.DIID
	dbQICItem.DbQueryName = apiQICItem.DbQueryName
	dbQICItem.RequestColumn = apiQICItem.RequestColumn
	dbQICItem.DbTblColSource = apiQICItem.DbTblColSource
	dbQICItem.Type = apiQICItem.Type
	dbQICItem.ChangeDate = apiQICItem.ChangeDate
	dbQICItem.FixDate = apiQICItem.FixDate
	dbQICItem.OkDate = apiQICItem.OkDate
	dbQICItem.Creator = apiQICItem.Creator
	dbQICItem.Modifier = apiQICItem.Modifier
	dbQICItem.Created = apiQICItem.Created
	dbQICItem.Modified = apiQICItem.Modified
	return dbQICItem, nil
}

// DbToAPIQueryItegrityCheckItem converts an DbDSItemItegrity record to a
// APIDSItemItegrity record.
func DbToAPIQueryItegrityCheckItem(
	dbQICItem DbQueryItegrityCheckItem,
) (
	APIQueryItegrityCheckItem,
) {
	var apiQICItem APIQueryItegrityCheckItem
	apiQICItem.ID = dbQICItem.ID
	apiQICItem.DIID = dbQICItem.DIID
	apiQICItem.DbQueryName = dbQICItem.DbQueryName
	apiQICItem.RequestColumn = dbQICItem.RequestColumn
	apiQICItem.DbTblColSource = dbQICItem.DbTblColSource
	apiQICItem.Type = dbQICItem.Type
	apiQICItem.ChangeDate = dbQICItem.ChangeDate
	apiQICItem.FixDate = dbQICItem.FixDate
	apiQICItem.OkDate = dbQICItem.OkDate
	apiQICItem.Creator = dbQICItem.Creator
	apiQICItem.Modifier = dbQICItem.Modifier
	apiQICItem.Created = dbQICItem.Created
	apiQICItem.Modified = dbQICItem.Modified
	return apiQICItem
}

// APIToDbDataIntegrityItem converts an APIDataIntegrityItem record to a
// DbDataIntegrityItem record.
func APIToDbDataIntegrityItem(
	apiDIItem APIDataIntegrityItem,
) (
	DbDataIntegrityItem,
	error,
) {
	var dbDIItem DbDataIntegrityItem
	dbDIItem.ID = apiDIItem.ID
	dbDIItem.DIID = apiDIItem.DIID
	dbDIItem.SeqNum = apiDIItem.SeqNum
	dbDIItem.DbTblName = apiDIItem.DbTblName
	dbDIItem.ColName = apiDIItem.ColName
	dbDIItem.DbTblColSource = apiDIItem.DbTblColSource
	dbDIItem.Type = apiDIItem.Type
	dbDIItem.FixDate = apiDIItem.FixDate
	dbDIItem.OutOfSyncDate = apiDIItem.OutOfSyncDate
	dbDIItem.Creator = apiDIItem.Creator
	dbDIItem.Modifier = apiDIItem.Modifier
	dbDIItem.Created = apiDIItem.Created
	dbDIItem.Modified = apiDIItem.Modified
	return dbDIItem, nil
}

// DbToAPIDataIntegrityItem converts an DbDataIntegrityItem record to a
// APIDataIntegrityItem record.
func DbToAPIDataIntegrityItem(
	dbDIItem DbDataIntegrityItem,
) (
	APIDataIntegrityItem,
) {
	var apiDIItem APIDataIntegrityItem
	apiDIItem.ID = dbDIItem.ID
	apiDIItem.DIID = dbDIItem.DIID
	apiDIItem.SeqNum = dbDIItem.SeqNum
	apiDIItem.DbTblName = dbDIItem.DbTblName
	apiDIItem.ColName = dbDIItem.ColName
	apiDIItem.DbTblColSource = dbDIItem.DbTblColSource
	apiDIItem.Type = dbDIItem.Type
	apiDIItem.FixDate = dbDIItem.FixDate
	apiDIItem.OutOfSyncDate = dbDIItem.OutOfSyncDate
	apiDIItem.Creator = dbDIItem.Creator
	apiDIItem.Modifier = dbDIItem.Modifier
	apiDIItem.Created = dbDIItem.Created
	apiDIItem.Modified = dbDIItem.Modified
	return apiDIItem
}

// APIToDbDataIntegrity converts an APIDataIntegrity record to a
// DbDataIntegrity record.
func APIToDbDataIntegrity(
	apiDI APIDataIntegrity,
) (
	DbDataIntegrity, error,
) {
	var dbDI DbDataIntegrity
	dbDI.ID = apiDI.ID
	dbDI.DbTblName = apiDI.DbTblName
	dbDI.OutOfSyncDate = apiDI.OutOfSyncDate
	dbDI.RunDate = apiDI.RunDate
	dbDI.Creator = apiDI.Creator
	dbDI.Modifier = apiDI.Modifier
	dbDI.Created = apiDI.Created
	dbDI.Modified = apiDI.Modified
	return dbDI, nil
}

// DbToAPIDataIntegrity converts an DbDataIntegrity record to a
// APIDataIntegrity record.
func DbToAPIDataIntegrity(
	dbDI DbDataIntegrity,
	items []APIDataIntegrityItem,
) (
	APIDataIntegrity,
) {
	var apiDI APIDataIntegrity
	apiDI.ID = dbDI.ID
	apiDI.DbTblName = dbDI.DbTblName
	apiDI.OutOfSyncDate = dbDI.OutOfSyncDate
	apiDI.RunDate = dbDI.RunDate
	apiDI.Creator = dbDI.Creator
	apiDI.Modifier = dbDI.Modifier
	apiDI.Created = dbDI.Created
	apiDI.Modified = dbDI.Modified
	apiDI.Items = items
	return apiDI
}
