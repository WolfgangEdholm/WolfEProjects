package qdocitemrepo

import (
	"fmt"

	"plan-loader/models"
	"plan-loader/utils"
)

var addFields string =
/*   01    "id, " + */
/*   02 */ "queryId, " +
	/* 03 */ "seqNum, " +
	/* 04 */ "itemKind, " +
	/* 05 */ "itemName, " +
	/* 06 */ "param1, " +
	/* 07 */ "param2, " +
	/* 08 */ "creator, " +
	/* 09 */ "modifier, " +
	/* 10 */ "created, " +
	/* 11 */ "modified"

var readFields string =
/*   01 */ "id, " +
	/* 02 */ "queryId, " +
	/* 03 */ "seqNum, " +
	/* 04 */ "itemKind, " +
	/* 05 */ "itemName, " +
	/* 06 */ "param1, " +
	/* 07 */ "param2, " +
	/* 08 */ "creator, " +
	/* 09 */ "modifier, " +
	/* 10 */ "created, " +
	/* 11 */ "modified"

var updateFields string =
/*   01    "id, " + */
/*   02 */ "queryId = ?, " +
	/* 03 */ "seqNum = ?, " +
	/* 04 */ "itemKind = ?, " +
	/* 05 */ "itemName = ?, " +
	/* 06 */ "param1 = ?, " +
	/* 07 */ "param2 = ?, " +
	/* 08 */ "creator = ?, " +
	/* 09 */ "modifier = ?, " +
	/* 10 */ "created = ?, " +
	/* 11 */ "modified = ?"

var table = ".QueryItem"
var parentId = "queryID"
var orderColumn = "seqNum"

// GetAllChildren gets all DbQueryDocItem records with the given parent id.
func GetAllChildren(docHeadID int64) ([]models.DbQueryDocItem, error) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	dataItems := make([]models.DbQueryDocItem, 0)
	query := "SELECT " + readFields + " FROM " + dbTable +
		" WHERE " + parentId + " = ? ORDER BY " + orderColumn + ";"
	rows, queryErr := db.Query(query, docHeadID)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbQueryDocItem
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.QueryID,
			/* 03 */ &data.SeqNum,
			/* 04 */ &data.ItemKind,
			/* 05 */ &data.ItemName,
			/* 06 */ &data.Param1,
			/* 07 */ &data.Param2,
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

// Get gets the DbQueryDocItem record with the given id.
func Get(id int64) (models.DbQueryDocItem, error) {
	var data models.DbQueryDocItem
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "SELECT " + readFields + " FROM " + dbTable + " WHERE id = ?;"
	row := db.QueryRow(query, id)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.QueryID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.ItemKind,
		/* 05 */ &data.ItemName,
		/* 06 */ &data.Param1,
		/* 07 */ &data.Param2,
		/* 08 */ &data.Creator,
		/* 09 */ &data.Modifier,
		/* 10 */ &data.Created,
		/* 11 */ &data.Modified,
	)
	return data, nil
}

// Put updates the given DbQueryDocItem record.
func Put(id int64, data models.DbQueryDocItem) (models.DbQueryDocItem, error) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "UPDATE " + dbTable + " SET " + updateFields + " WHERE id = ?"
	//fmt.Println("PUT ID=", id," SQL=", query)
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		utils.PushWarnings(stmtErr.Error())
		return data, stmtErr
	}
	defer stmt.Close()
	_, queryErr := stmt.Exec(
		/* 02 */ &data.QueryID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.ItemKind,
		/* 05 */ &data.ItemName,
		/* 06 */ &data.Param1,
		/* 07 */ &data.Param2,
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

// Post creates a new DbQueryDocItem record.
func Post(data models.DbQueryDocItem) (int64, error) {
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
		/* 02 */ &data.QueryID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.ItemKind,
		/* 05 */ &data.ItemName,
		/* 06 */ &data.Param1,
		/* 07 */ &data.Param2,
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

// Delete deletes the DbQueryDocItem record with the given id.
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
