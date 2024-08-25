package dbrepo

import (
	"fmt"

	"plan-loader/models"
	"plan-loader/utils"
	//"strconv"
)

// var tableInfoFields string =
// /*  01 */ "Field, " +
// 	/* 02 */ "Type, " +
// 	/* 03 */ "Null, " +
// 	/* 04 */ "Key, " +
// 	/* 05 */ "Default, " +
// 	/* 06 */ "Extra"

// GetAllDatabases gets a list of all available databases on this server.
func GetAllDatabases() ([]models.DbDatabase, error) {
	db := utils.DBOpen()
	defer db.Close()
	dataItems := make([]models.DbDatabase, 0)
	query := "SHOW DATABASES"
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbDatabase
		if err := rows.Scan(
			/* 01 */ &data.DatabaseName,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// Doesn't work because of the driver's connection setup
// Replaced with logice that changes the connection string
// // SetCurrentDatabase changes the current database to the specufied one.
// func SetCurrentDatabase(database string) (error) {
// 	db := utils.DBOpen()
// 	defer db.Close()
// 	// dataItems := make([]models.DbDatabase, 0)
// 	query := "USE " + database
// 	fmt.Printf("Current Database=%s\n", database)
// 	_, queryErr := db.Query(query)
// 	if queryErr != nil {
// 		utils.PushWarnings(queryErr.Error())
// 		return queryErr
// 	}
// 	return nil
// }

// GetAllTables gets a list of all available tables in the current
// database.
func GetAllTables() ([]models.DbTable, error) {
	db := utils.DBOpen()
	defer db.Close()
	dataItems := make([]models.DbTable, 0)
	query := "SHOW TABLES"
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbTable
		if err := rows.Scan(
			/* 01 */ &data.TableName,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// GetTableInfo retrieves column information for the specified
// table.
func GetTableInfo(tableName string) ([]models.DbColumnDef, error) {
	db := utils.DBOpen()
	defer db.Close()
	dataItems := make([]models.DbColumnDef, 0)
	query := "DESCRIBE " + tableName
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbColumnDef
		if err := rows.Scan(
			/* 01 */ &data.ColumnName,
			/* 02 */ &data.Type,
			/* 03 */ &data.Null,
			/* 04 */ &data.Key,
			/* 05 */ &data.Default,
			/* 06 */ &data.Extra,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// GetForeignKeys retrieves column information for the specified
// table.
func GetForeignKeys(database string) (
	[]models.DbForeignKeys, error) {
	fmt.Printf("Database=%s\n", database)
	db := utils.DBOpen()
	defer db.Close()
	dataItems := make([]models.DbForeignKeys, 0)
	query := "SELECT table_name, column_name, " +
		"referenced_table_name, referenced_column_name " +
		"FROM information_schema.key_column_usage " +
		"WHERE referenced_table_name IS NOT NULL " +
		"AND TABLE_SCHEMA = '" + database + "'"
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbForeignKeys
		if err := rows.Scan(
			/* 01 */ &data.TableName,
			/* 02 */ &data.ColumnName,
			/* 03 */ &data.RefTableName,
			/* 04 */ &data.RefColumnName,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}
