package tsoutitemrepo

import (
	"fmt"

	"plan-loader/models"
	"plan-loader/utils"
	"strings"
)

var addFields string =
/*   01    "id, " + */
/*   02 */ "tsId, " +
	/* 03 */ "seqNum, " +
	/* 04 */ "dbTransItem, " +
	/* 05 */ "changeDate, " +
	/* 06 */ "itemKind, " +
	/* 07 */ "comment, " +
	/* 08 */ "creator, " +
	/* 19 */ "modifier, " +
	/* 10 */ "created, " +
	/* 11 */ "modified"

var readFields string =
/*   01 */ "id, " +
	/* 02 */ "tsId, " +
	/* 03 */ "seqNum, " +
	/* 04 */ "dbTransItem, " +
	/* 05 */ "changeDate, " +
	/* 06 */ "itemKind, " +
	/* 07 */ "comment, " +
	/* 08 */ "creator, " +
	/* 09 */ "modifier, " +
	/* 10 */ "created, " +
	/* 11 */ "modified"

var updateFields string =
/*   01    "id, " + */
/*   02 */ "tsId = ?, " +
	/* 03 */ "seqNum = ?, " +
	/* 04 */ "dbTransItem = ?, " +
	/* 05 */ "changeDate = ?, " +
	/* 06 */ "itemKind = ?, " +
	/* 07 */ "comment = ?, " +
	/* 08 */ "creator = ?, " +
	/* 09 */ "modifier = ?, " +
	/* 10 */ "created = ?, " +
	/* 11 */ "modified = ?"

var table = ".TransSourceOutItem"
var orderColumn1 = "dbTransItem"
var orderColumn2 = "seqNum"
var parentIdName = "tsId"

// GetAll gets a DbTSOutItem record with the given id.
func GetAll() ([]models.DbTSOutItem, error) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	dataItems := make([]models.DbTSOutItem, 0)
	query := "SELECT " + readFields + " FROM " + dbTable + " ORDER BY " +
		orderColumn1 + ";"
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbTSOutItem
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.TSID,
			/* 03 */ &data.SeqNum,
			/* 04 */ &data.DbTransItem,
			/* 05 */ &data.ChangeDate,
			/* 06 */ &data.ItemKind,
			/* 07 */ &data.Comment,
			/* 08 */ &data.Creator,
			/* 09 */ &data.Modifier,
			/* 10 */ &data.Created,
			/* 11 */ &data.Modified,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// GetAllChildren gets all DbTSOutItem children with the given parent id.
func GetAllChildren(qsID int64) ([]models.DbTSOutItem, error) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	dataItems := make([]models.DbTSOutItem, 0)
	query := "SELECT " + readFields + " FROM " + dbTable +
		" WHERE " + parentIdName + " = ? ORDER BY " + orderColumn2 + ";"
	rows, queryErr := db.Query(query, qsID)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbTSOutItem
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.TSID,
			/* 03 */ &data.SeqNum,
			/* 04 */ &data.DbTransItem,
			/* 05 */ &data.ChangeDate,
			/* 06 */ &data.ItemKind,
			/* 07 */ &data.Comment,
			/* 08 */ &data.Creator,
			/* 09 */ &data.Modifier,
			/* 10 */ &data.Created,
			/* 11 */ &data.Modified,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// Get gets a DbTSOutItem record with the given id.
func Get(id int64) (models.DbTSOutItem, error) {
	var data models.DbTSOutItem
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "SELECT " + readFields + " FROM " + dbTable + " WHERE id = ?;"
	row := db.QueryRow(query, id)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.TSID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.DbTransItem,
		/* 05 */ &data.ChangeDate,
		/* 06 */ &data.ItemKind,
		/* 07 */ &data.Comment,
		/* 08 */ &data.Creator,
		/* 09 */ &data.Modifier,
		/* 10 */ &data.Created,
		/* 11 */ &data.Modified,
	)
	return data, nil
}

// Put updates the given DbTSOutItem record.
func Put(id int64, data models.DbTSOutItem) (models.DbTSOutItem, error) {
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
		/* 02 */ &data.TSID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.DbTransItem,
		/* 05 */ &data.ChangeDate,
		/* 06 */ &data.ItemKind,
		/* 07 */ &data.Comment,
		/* 08 */ &data.Creator,
		/* 09 */ &data.Modifier,
		/* 10 */ &data.Created,
		/* 11 */ &data.Modified,
		/* 01 */ id,
	)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return data, queryErr
	}
	data.ID = id
	return data, queryErr
}

// Post creates a new DbTSOutItem record.
func Post(data models.DbTSOutItem) (int64, error) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "INSERT INTO " + dbTable + " (" + addFields + ") VALUES(" +
		/* 02 */ "?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		fmt.Println("POST SQL=", query)
		utils.PushWarnings(stmtErr.Error())
		return -1, stmtErr
	}
	res, queryErr := stmt.Exec(
		/* 02 */ &data.TSID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.DbTransItem,
		/* 05 */ &data.ChangeDate,
		/* 06 */ &data.ItemKind,
		/* 07 */ &data.Comment,
		/* 08 */ &data.Creator,
		/* 09 */ &data.Modifier,
		/* 10 */ &data.Created,
		/* 11 */ &data.Modified,
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

// Delete deletes the DbTSOutItem record with the given id.
func Delete(id int64) error {
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

// GetAllQueryItems gets all DbTSOutItem matching the names of the given
// array of dbTransItem.
func GetAllTransItems(columns []string) ([]models.DbTSOutItem, error) {
	db := utils.DBOpen()
	defer db.Close()
	dataItems := make([]models.DbTSOutItem, 0)
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
		var data models.DbTSOutItem
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.TSID,
			/* 03 */ &data.SeqNum,
			/* 04 */ &data.DbTransItem,
			/* 05 */ &data.ChangeDate,
			/* 06 */ &data.ItemKind,
			/* 07 */ &data.Comment,
			/* 08 */ &data.Creator,
			/* 09 */ &data.Modifier,
			/* 10 */ &data.Created,
			/* 11 */ &data.Modified,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// Extension Functions
