package tsinitemrepo

import (
	"fmt"

	"plan-loader/models"
	"plan-loader/utils"
)

var readIntegrityFields string =
/*   01 */ "a.id, " +
	/* 02 */ "a.tsId, " +
	/* 03 */ "a.dbTransName, " +
	/* 04 */ "a.itemName, " +
	/* 05 */ "a.dbItemName, " +
	/* 06 */ "a.itemKind, " +
	/* 07 */ "c.changeDate, " +
	/* 08 */ "a.fixDate, " +
	/* 09 */ "b.okDate, " +
	/* 10 */ "a.creator, " +
	/* 11 */ "a.modifier, " +
	/* 12 */ "a.created, " +
	/* 13 */ "a.modified"

var addFields string =
/*   01    "id, " + */
/*   02 */ "tsId, " +
	/* 03 */ "seqNum, " +
	/* 04 */ "dbTransName, " +
	/* 05 */ "itemName, " +
	/* 06 */ "dbItemName, " +
	/* 07 */ "itemKind, " +
	/* 08 */ "fixDate, " +
	/* 09 */ "creator, " +
	/* 10 */ "modifier, " +
	/* 11 */ "created, " +
	/* 12 */ "modified"

var readFields string =
/*   01 */ "id, " +
	/* 02 */ "tsId, " +
	/* 03 */ "seqNum, " +
	/* 04 */ "dbTransName, " +
	/* 05 */ "itemName, " +
	/* 06 */ "dbItemName, " +
	/* 07 */ "itemKind, " +
	/* 08 */ "fixDate, " +
	/* 09 */ "creator, " +
	/* 10 */ "modifier, " +
	/* 11 */ "created, " +
	/* 12 */ "modified"

var updateFields string =
/*   01    "id, " + */
/*   02 */ "tsId = ?, " +
	/* 03 */ "seqNum = ?, " +
	/* 04 */ "dbTransName = ?, " +
	/* 05 */ "itemName = ?, " +
	/* 06 */ "dbItemName = ?, " +
	/* 07 */ "itemKind = ?, " +
	/* 08 */ "fixDate = ?, " +
	/* 09 */ "creator = ?, " +
	/* 10 */ "modifier = ?, " +
	/* 11 */ "created = ?, " +
	/* 12 */ "modified = ?"

var table = ".TransSourceInItem"
var headTable = ".TransSourceIn"
var outItemTable = ".TransSourceOutItem"

var parentIdName = "tsId"
var orderColumn = "seqNum"

// Backend Access Methods 9312345678941234567895123456789612345678971234567898

// GetIntegrity executes the standard system integrity query for all
// transofrmer items entered in TransSourceIn and TransSourceOut.
func GetIntegrity() ([]models.DbTransItegrityCheckItem, error) {
	db := utils.DBOpen()
	defer db.Close()
	itemTable := utils.SysDirectory + table
	itemTableJoinField1 := "tsId"
	itemTableJoinField2 := "dbItemName"
	headTable := utils.SysDirectory + headTable
	headTableJoinField := "id"

	outItemTable := utils.SysDirectory + outItemTable
	outItemTableJoinField := "dbItemName"

	dataItems := make([]models.DbTransItegrityCheckItem, 0)
	query := "SELECT " + readIntegrityFields + " FROM " + itemTable +
		" AS a JOIN " + headTable + " AS b ON b." + headTableJoinField +
		" = a." + itemTableJoinField1 +
		" JOIN " + outItemTable + " AS c ON c." + outItemTableJoinField +
		" = a." + itemTableJoinField2 +
		" ORDER BY a." + itemTableJoinField2 + ";"
	fmt.Println("Getting DS IN ", query)
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbTransItegrityCheckItem
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.TSID,
			/* 03 */ &data.DbTransName,
			/* 04 */ &data.ItemName,
			/* 05 */ &data.DbItemName,
			/* 06 */ &data.ItemKind,
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

// GetAllChildren gets all DbTSInItem children with the given parent id.
func GetAllChildren(qsID int64) ([]models.DbTSInItem, error) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	dataItems := make([]models.DbTSInItem, 0)
	query := "SELECT " + readFields + " FROM " + dbTable +
		" WHERE " + parentIdName + " = ? ORDER BY " + orderColumn + ";"
	rows, queryErr := db.Query(query, qsID)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbTSInItem
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.TSID,
			/* 03 */ &data.SeqNum,
			/* 04 */ &data.DbTransName,
			/* 05 */ &data.ItemName,
			/* 06 */ &data.DbItemName,
			/* 07 */ &data.ItemKind,
			/* 08 */ &data.FixDate,
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

// Get gets the DbTSInItem record with the given id.
func Get(id int64) (models.DbTSInItem, error) {
	var data models.DbTSInItem
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "SELECT " + readFields + " FROM " + dbTable + " WHERE id = ?;"
	row := db.QueryRow(query, id)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.TSID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.DbTransName,
		/* 05 */ &data.ItemKind,
		/* 06 */ &data.DbItemName,
		/* 07 */ &data.ItemKind,
		/* 08 */ &data.FixDate,
		/* 09 */ &data.Creator,
		/* 10 */ &data.Modifier,
		/* 11 */ &data.Created,
		/* 12 */ &data.Modified,
	)
	return data, nil
}

// Put updates the give DbTSInItem record.
func Put(id int64, data models.DbTSInItem) (models.DbTSInItem, error) {
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
		/* 04 */ &data.DbTransName,
		/* 05 */ &data.ItemName,
		/* 06 */ &data.DbItemName,
		/* 07 */ &data.ItemKind,
		/* 08 */ &data.FixDate,
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

// Post creates a new DbTSInItem record.
func Post(data models.DbTSInItem) (int64, error) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "INSERT INTO " + dbTable + " (" + addFields + ") VALUES(" +
		/* 02 */ "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? );"
	fmt.Println("WRITING In ITEM ", query)
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		fmt.Println("POST SQL=", query)
		utils.PushWarnings(stmtErr.Error())
		return -1, stmtErr
	}
	res, queryErr := stmt.Exec(
		/* 02 */ &data.TSID,
		/* 03 */ &data.SeqNum,
		/* 04 */ &data.DbTransName,
		/* 05 */ &data.ItemName,
		/* 06 */ &data.DbItemName,
		/* 07 */ &data.ItemKind,
		/* 08 */ &data.FixDate,
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

// Delete deletes the DbTSInItem record with the given id.
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

// Extension Functions
