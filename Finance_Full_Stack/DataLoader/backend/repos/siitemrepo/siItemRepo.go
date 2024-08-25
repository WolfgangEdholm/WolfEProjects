package qsoutitemrepo

import (
	"fmt"

	"plan-loader/models"
	"plan-loader/utils"
	"strings"
)

var addFields string =
/*   01    "id, " + */
/*   02 */ "siId, " +
	/* 03 */ "seqNum, " +
	/* 04 */ "dbTblColName, " +
	/* 05 */ "changeDate, " +
	/* 06 */ "type, " +
	/* 07 */ "oldType, " +
	/* 08 */ "comment, " +
	/* 09 */ "creator, " +
	/* 10 */ "modifier, " +
	/* 11 */ "created, " +
	/* 12 */ "modified"

var readFields string =
/*   01 */ "id, " +
	/* 02 */ "siId, " +
	/* 03 */ "seqNum, " +
	/* 04 */ "dbTblColName, " +
	/* 05 */ "changeDate, " +
	/* 06 */ "type, " +
	/* 07 */ "oldType, " +
	/* 08 */ "comment, " +
	/* 09 */ "creator, " +
	/* 10 */ "modifier, " +
	/* 11 */ "created, " +
	/* 12 */ "modified"

var updateFields string =
/*   01    "id, " + */
/*   02 */ "siId = ?, " +
	/* 03 */ "seqNum = ?, " +
	/* 04 */ "dbTblColName = ?, " +
	/* 05 */ "changeDate = ?, " +
	/* 06 */ "type = ?, " +
	/* 07 */ "oldType = ?, " +
	/* 08 */ "comment = ?, " +
	/* 09 */ "creator = ?, " +
	/* 10 */ "modifier = ?, " +
	/* 11 */ "created = ?, " +
	/* 12 */ "modified = ?"

var table = ".StructIntegrityItem"
var orderColumn1 = "dbTblColName"
var orderColumn2 = "seqNum"
var parentIdName = "SIID"

// GetAll gets all DbStructIntegrityItem records in the database.
func GetAll() (
	[]models.DbStructIntegrityItem,
	error,
) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	dataItems := make([]models.DbStructIntegrityItem, 0)
	query := "SELECT " + readFields + " FROM " + dbTable + " ORDER BY " +
		orderColumn1 + ";"
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbStructIntegrityItem
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.SIID,
			/* 03 */ &data.SeqNum,
			/* 04 */ &data.DbTblColName,
			/* 05 */ &data.ChangeDate,
			/* 06 */ &data.Type,
			/* 07 */ &data.OldType,
			/* 08 */ &data.Comment,
			/* 09 */ &data.Creator,
			/* 10 */ &data.Modifier,
			/* 11 */ &data.Created,
			/* 12 */ &data.Modified,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// GetAllChildren gets all DbStructIntegrityItem children of the the
// DbStructIntegrity record with the given siID parent id.
func GetAllChildren(
	siID int64,
) (
	[]models.DbStructIntegrityItem,
	error,
) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	dataItems := make([]models.DbStructIntegrityItem, 0)
	query := "SELECT " + readFields + " FROM " + dbTable +
		" WHERE " + parentIdName + " = ? ORDER BY " + orderColumn2 + ";"
	rows, queryErr := db.Query(query, siID)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbStructIntegrityItem
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.SIID,
			/* 03 */ &data.SeqNum,
			/* 04 */ &data.DbTblColName,
			/* 05 */ &data.ChangeDate,
			/* 06 */ &data.Type,
			/* 07 */ &data.OldType,
			/* 08 */ &data.Comment,
			/* 09 */ &data.Creator,
			/* 10 */ &data.Modifier,
			/* 11 */ &data.Created,
			/* 12 */ &data.Modified,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// Get gets a DbStructIntegrityItem record with the given id.
func Get(
	id int64,
) (
	models.DbStructIntegrityItem,
	error,
) {
	var data models.DbStructIntegrityItem
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "SELECT " + readFields + " FROM " + dbTable + " WHERE id = ?;"
	row := db.QueryRow(query, id)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.SIID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.DbTblColName,
		/* 05 */ &data.ChangeDate,
		/* 06 */ &data.Type,
		/* 07 */ &data.OldType,
		/* 08 */ &data.Comment,
		/* 09 */ &data.Creator,
		/* 10 */ &data.Modifier,
		/* 11 */ &data.Created,
		/* 12 */ &data.Modified,
	)
	return data, nil
}

// Put updates the given DbStructIntegrityItem record.
func Put(
	id int64,
	data models.DbStructIntegrityItem,
) (
	models.DbStructIntegrityItem,
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
		/* 02 */ &data.SIID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.DbTblColName,
		/* 05 */ &data.ChangeDate,
		/* 06 */ &data.Type,
		/* 07 */ &data.OldType,
		/* 08 */ &data.Comment,
		/* 09 */ &data.Creator,
		/* 10 */ &data.Modifier,
		/* 11 */ &data.Created,
		/* 12 */ &data.Modified,
		/* 01 */ id,
	)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return data, queryErr
	}
	data.ID = id
	return data, queryErr
}

// Post creates a new DbStructIntegrityItem record.
func Post(
	data models.DbStructIntegrityItem,
) (
	int64,
	error,
) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "INSERT INTO " + dbTable + " (" + addFields + ") VALUES(" +
		/* 02 */ "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? );"
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		fmt.Println("POST SQL=", query)
		utils.PushWarnings(stmtErr.Error())
		return -1, stmtErr
	}
	res, queryErr := stmt.Exec(
		/* 02 */ &data.SIID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.DbTblColName,
		/* 05 */ &data.ChangeDate,
		/* 06 */ &data.Type,
		/* 07 */ &data.OldType,
		/* 08 */ &data.Comment,
		/* 09 */ &data.Creator,
		/* 10 */ &data.Modifier,
		/* 11 */ &data.Created,
		/* 12 */ &data.Modified,
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

// Delete deletes a DbStructIntegrityItem record with the given id.
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

// GetAllQueryItems gets all DbStructIntegrityItem matching the names of the given
// array of dbTblColNames.
func GetAllQueryItems(
	columns []string,
) (
	[]models.DbStructIntegrityItem,
	error,
) {
	db := utils.DBOpen()
	defer db.Close()
	dataItems := make([]models.DbStructIntegrityItem, 0)
	dbTable := utils.SysDirectory + table

	var whereClause strings.Builder
	op := " where "
	for _, col := range columns {
		whereClause.WriteString(op)
		whereClause.WriteString(orderColumn1 + "='")
		whereClause.WriteString(col)
		whereClause.WriteString("'")
		op = " or "
	}
	whereClause.WriteString(";")

	query := "SELECT " + readFields + " FROM " + dbTable +
		whereClause.String()

	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbStructIntegrityItem
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.SIID,
			/* 03 */ &data.SeqNum,
			/* 04 */ &data.DbTblColName,
			/* 05 */ &data.ChangeDate,
			/* 06 */ &data.Type,
			/* 07 */ &data.OldType,
			/* 08 */ &data.Comment,
			/* 09 */ &data.Creator,
			/* 10 */ &data.Modifier,
			/* 11 */ &data.Created,
			/* 12 */ &data.Modified,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// Extension Functions
