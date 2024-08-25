package models

// DbDatabase shows all databases
// available on the server.
type DbDatabase struct {
	DatabaseName string `json:"databaseName"`
}

// DbColumnDef contains information about the columns
// in a table.
type DbColumnDef struct {
	ColumnName string `json:"columnName"`
	Type string `json:"type"`
	Null string `json:"null"`
	Key string `json:"key"`
	Default *string `json:"default"`
	Extra string `json:"extra"`
}

// DbForeignKeys contains information about the columns
// in a table.
type DbForeignKeys struct {
	TableName string `json:"tableName"`
	ColumnName string `json:"columnName"`
	RefTableName string `json:"refTableName"`
	RefColumnName string `json:"refColumnName"`
}

// DbTable shows all tables
// available on the current database.
type DbTable struct {
	TableName string `json:"tableName"`
}

// APITable shows all tables
// available on the current database.
type APITable struct {
	TableName string `json:"tableName"`
	Columns []DbColumnDef `json:"columns" binding:"required"`
}

// Associated Functions

// DbToAPITable converts a DbSegment record to an APISegment one.
func DbToAPITable(dbTable DbTable, columns []DbColumnDef) APITable {
	var apiTable APITable
	apiTable.TableName = dbTable.TableName;
	apiTable.Columns = columns
	return apiTable
}
