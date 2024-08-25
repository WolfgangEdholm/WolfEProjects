package models

// ListRequest specifies the request sql
type ListRequest struct {
	Request string `json:"request"`
}

// QueryRequest specifies the request sql
type QueryRequest struct {
	Request string `json:"request"`
}

// SaveQuery saves the (usually) trabsformed qyery data
type QuerySave struct {
	WriteMode string `json:"writeMode"`
	DeleteSql string `json:"deleteSql"`
	CreateSql []string `json:"createSql"`
	SaveSql []string `json:"saveSql"`
}

