package diitemrepo

import (
	"fmt"

	"plan-loader/models"
	"plan-loader/utils"
)

var readIntegrityFields string =
/*   01 */ "a.id, " +
	/* 02 */ "a.diId, " +
	/* 03 */ "a.dbTblName AS queryName, " +
	/* 04 */ "a.colName AS requestColumn, " +
	/* 05 */ "a.dbTblColSource, " +
	/* 06 */ "a.type, " +
	/* 07 */ "c.changeDate, " +
	/* 08 */ "a.fixDate, " +
	/* 09 */ "a.fixDate AS okDate, " +
	/* 10 */ "a.creator, " +
	/* 11 */ "a.modifier, " +
	/* 12 */ "a.created, " +
	/* 13 */ "a.modified"

var addFields string =
/*   01    "id, " + */
/*   02 */ "diId, " +
	/* 03 */ "seqNum, " +
	/* 04 */ "dbTblName, " +
	/* 05 */ "colName, " +
	/* 06 */ "dbTblColSource, " +
	/* 07 */ "type, " +
	/* 08 */ "fixDate, " +
	/* 09 */ "outOfSyncDate, " +
	/* 10 */ "creator, " +
	/* 11 */ "modifier, " +
	/* 12 */ "created, " +
	/* 13 */ "modified"

var readFields string =
/*   01 */ "id, " +
	/* 02 */ "diId, " +
	/* 03 */ "seqNum, " +
	/* 04 */ "dbTblName, " +
	/* 05 */ "colName, " +
	/* 06 */ "dbTblColSource, " +
	/* 07 */ "type, " +
	/* 08 */ "fixDate, " +
	/* 09 */ "outOfSyncDate, " +
	/* 10 */ "creator, " +
	/* 11 */ "modifier, " +
	/* 12 */ "created, " +
	/* 13 */ "modified"

var updateFields string =
/*   01    "id, " + */
/*   02 */ "diId = ?, " +
	/* 03 */ "seqNum = ?, " +
	/* 04 */ "dbTblName = ?, " +
	/* 05 */ "colName = ?, " +
	/* 06 */ "dbTblColSource = ?, " +
	/* 07 */ "type = ?, " +
	/* 08 */ "fixDate = ?, " +
	/* 09 */ "outOfSyncDate = ?, " +
	/* 10 */ "creator = ?, " +
	/* 11 */ "modifier = ?, " +
	/* 12 */ "created = ?, " +
	/* 13 */ "modified = ?"

var table = ".DataIntegrityItem"
var headTable = ".DataIntegrity"
var structItemTable = ".StructIntegrityItem"

var parentIdName = "diId"
var orderColumn = "seqNum"

// GetIntegrity executes the standard system integrity query for all
// query columns entered in QuerySourceIn and QuerySourceOut.
func GetQueryIntegrity() (
	[]models.DbQueryItegrityCheckItem,
	error,
) {
	db := utils.DBOpen()
	defer db.Close()
	itemTable := utils.SysDirectory + table
	itemTableJoinField1 := "diId"
	itemTableJoinField2 := "dbTblColSource"
	headTable := utils.SysDirectory + headTable
	headTableJoinField := "id"

	structItemTable := utils.SysDirectory + structItemTable
	structItemTableJoinField := "dbTblColName"

	dataItems := make([]models.DbQueryItegrityCheckItem, 0)
	query := "SELECT " + readIntegrityFields + " FROM " + itemTable +
		" AS a JOIN " + headTable + " AS b ON b." + headTableJoinField +
		" = a." + itemTableJoinField1 +
		" JOIN " + structItemTable + " AS c ON c." + structItemTableJoinField +
		" = a." + itemTableJoinField2 +
		" ORDER BY a." + itemTableJoinField2 + ";"
	fmt.Println("Getting Query Integrity ", query)
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbQueryItegrityCheckItem
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.DIID,
			/* 03 */ &data.DbQueryName,
			/* 04 */ &data.RequestColumn,
			/* 05 */ &data.DbTblColSource,
			/* 06 */ &data.Type,
			/* 07 */ &data.ChangeDate,
			/* 08 */ &data.FixDate,
			/* 09 */ &data.OkDate,
			/* 10 */ &data.Creator,
			/* 11 */ &data.Modifier,
			/* 12 */ &data.Created,
			/* 13 */ &data.Modified,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// GetAllChildren gets the all DbDataIntegrityItem record with the given
// parent ID diID.
func GetAllChildren(
	diID int64,
) (
	[]models.DbDataIntegrityItem,
	error,
) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	dataItems := make([]models.DbDataIntegrityItem, 0)
	query := "SELECT " + readFields + " FROM " + dbTable +
		" WHERE " + parentIdName + " = ? ORDER BY " + orderColumn + ";"
	rows, queryErr := db.Query(query, diID)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbDataIntegrityItem
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.DIID,
			/* 03 */ &data.SeqNum,
			/* 04 */ &data.DbTblName,
			/* 05 */ &data.ColName,
			/* 06 */ &data.DbTblColSource,
			/* 07 */ &data.Type,
			/* 08 */ &data.FixDate,
			/* 09 */ &data.OutOfSyncDate,
			/* 10 */ &data.Creator,
			/* 11 */ &data.Modifier,
			/* 12 */ &data.Created,
			/* 13 */ &data.Modified,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// Get gets the DbDataIntegrityItem record with the given id.
func Get(
	id int64,
) (
	models.DbDataIntegrityItem,
	error,
) {
	var data models.DbDataIntegrityItem
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "SELECT " + readFields + " FROM " + dbTable + " WHERE id = ?;"
	row := db.QueryRow(query, id)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.DIID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.DbTblName,
		/* 05 */ &data.ColName,
		/* 06 */ &data.DbTblColSource,
		/* 07 */ &data.Type,
		/* 08 */ &data.FixDate,
		/* 09 */ &data.OutOfSyncDate,
		/* 10 */ &data.Creator,
		/* 11 */ &data.Modifier,
		/* 12 */ &data.Created,
		/* 13 */ &data.Modified,
	)
	return data, nil
}

// Put updates the given DbDataIntegrityItem record.
func Put(
	id int64,
	data models.DbDataIntegrityItem,
) (
	models.DbDataIntegrityItem,
	error,
) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "UPDATE " + dbTable + " SET " + updateFields + " WHERE id = ?"
	//fmt.Println("PUT ID=", id, " SQL=", query)
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		utils.PushWarnings(stmtErr.Error())
		return data, stmtErr
	}
	defer stmt.Close()
	_, queryErr := stmt.Exec(
		/* 02 */ &data.DIID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.DbTblName,
		/* 05 */ &data.ColName,
		/* 06 */ &data.DbTblColSource,
		/* 07 */ &data.Type,
		/* 08 */ &data.FixDate,
		/* 09 */ &data.OutOfSyncDate,
		/* 10 */ &data.Creator,
		/* 11 */ &data.Modifier,
		/* 12 */ &data.Created,
		/* 13 */ &data.Modified,
		/* 01 */ id,
	)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return data, queryErr
	}
	data.ID = id
	return data, queryErr
}

// Post creates a new DbDataIntegrityItem record.
func Post(
	data models.DbDataIntegrityItem,
) (
	int64,
	error,
) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "INSERT INTO " + dbTable + " (" + addFields + ") VALUES(" +
		/* 02 */ "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
	fmt.Println("WRITING In ITEM ", query)
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		fmt.Println("POST SQL=", query)
		utils.PushWarnings(stmtErr.Error())
		return -1, stmtErr
	}
	res, queryErr := stmt.Exec(
		/* 02 */ &data.DIID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.DbTblName,
		/* 05 */ &data.ColName,
		/* 06 */ &data.DbTblColSource,
		/* 07 */ &data.Type,
		/* 08 */ &data.FixDate,
		/* 09 */ &data.OutOfSyncDate,
		/* 10 */ &data.Creator,
		/* 11 */ &data.Modifier,
		/* 12 */ &data.Created,
		/* 13 */ &data.Modified,
	)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return -1, queryErr
	}
	id, getLastInsertIDErr := res.LastInsertId()
	if getLastInsertIDErr != nil {
		utils.PushWarnings(getLastInsertIDErr.Error())
		return -1, getLastInsertIDErr
	}
	return id, nil
}

// Delete deletes the DbDataIntegrityItem record with the given id.
func Delete(
	id int64,
) error {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table

	query := "DELETE FROM " + dbTable + " WHERE id = ?"
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		utils.PushWarnings(stmtErr.Error())
		return stmtErr
	}
	_, queryErr := stmt.Exec(id)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return queryErr
	}
	return queryErr
}

// Extension Functions
