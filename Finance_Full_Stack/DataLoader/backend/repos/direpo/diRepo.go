package direpo

import (
	//"fmt"

	"plan-loader/models"
	"plan-loader/utils"
)

var addFields string =
/*   01    "id, " + */
/*   02 */ "dbTblName, " +
	/* 03 */ "outOfSyncDate, " +
	/* 04 */ "runDate, " +
	/* 05 */ "creator, " +
	/* 06 */ "modifier, " +
	/* 07 */ "created, " +
	/* 08 */ "modified"

var readFields string =
/*   01 */ "id, " +
	/* 02 */ "dbTblName, " +
	/* 03 */ "outOfSyncDate, " +
	/* 04 */ "runDate, " +
	/* 05 */ "creator, " +
	/* 06 */ "modifier, " +
	/* 07 */ "created, " +
	/* 08 */ "modified"

var updateFields string =
/*   01    "id" */
/*   02 */ "dbTblName = ?, " +
	/* 03 */ "outOfSyncDate = ?, " +
	/* 04 */ "runDate = ?, " +
	/* 05 */ "creator = ?, " +
	/* 06 */ "modifier = ?, " +
	/* 07 */ "created = ?, " +
	/* 08 */ "modified = ?"

var table = ".DataIntegrity"
var orderColumn = "dbTblName"

// GetAll gets all DbDataIntegrity records in the database.
func GetAll() (
	[]models.DbDataIntegrity,
	error,
) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	dataItems := make([]models.DbDataIntegrity, 0)
	query := "SELECT " + readFields + " FROM " + dbTable + " ORDER BY " +
		orderColumn + ";"
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbDataIntegrity
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.DbTblName,
			/* 03 */ &data.OutOfSyncDate,
			/* 04 */ &data.RunDate,
			/* 05 */ &data.Creator,
			/* 06 */ &data.Modifier,
			/* 07 */ &data.Created,
			/* 08 */ &data.Modified,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// Get gets the DbQSIn DbDataIntegrity with the given id.
func Get(
	id int64,
) (
	models.DbDataIntegrity,
	error,
) {
	var data models.DbDataIntegrity
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "SELECT " + readFields + " FROM " + dbTable + " WHERE id = ?;"
	row := db.QueryRow(query, id)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.DbTblName,
		/* 03 */ &data.OutOfSyncDate,
		/* 04 */ &data.RunDate,
		/* 05 */ &data.Creator,
		/* 06 */ &data.Modifier,
		/* 07 */ &data.Created,
		/* 08 */ &data.Modified,
	)
	return data, nil
}

// GetFromName gets the DbDataIntegrity record with the given dbTblName.
func GetFromName(
	name string,
) (
	models.DbDataIntegrity,
	error,
) {
	var data models.DbDataIntegrity
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "SELECT " + readFields + " FROM " + dbTable +
		" WHERE " + orderColumn + " = ?;"
	row := db.QueryRow(query, name)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.DbTblName,
		/* 03 */ &data.OutOfSyncDate,
		/* 04 */ &data.RunDate,
		/* 05 */ &data.Creator,
		/* 06 */ &data.Modifier,
		/* 07 */ &data.Created,
		/* 08 */ &data.Modified,
	)
	return data, nil
}

// Put updates the DbDataIntegrity record with the given id.
func Put(
	id int64, data models.DbDataIntegrity,
) (
	models.DbDataIntegrity,
	error,
) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "UPDATE " + dbTable + " SET " + updateFields + " WHERE id = ?"
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		utils.PushWarnings(stmtErr.Error())
		return data, stmtErr
	}
	defer stmt.Close()
	_, queryErr := stmt.Exec(
		/* 02 */ &data.DbTblName,
		/* 03 */ &data.OutOfSyncDate,
		/* 04 */ &data.RunDate,
		/* 05 */ &data.Creator,
		/* 06 */ &data.Modifier,
		/* 07 */ &data.Created,
		/* 08 */ &data.Modified,
		/* 01 */ id,
	)
	//fmt.Println("Put Return", dd)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return data, queryErr
	}
	data.ID = id
	return data, queryErr
}

// Post creates a new DbDataIntegrity record.
func Post(
	data models.DbDataIntegrity,
) (
	int64,
	error,
) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "INSERT INTO " + dbTable + " (" + addFields + ") VALUES(" +
		/* 02 */ "?, ?, ?, ?, ?, ?, ?);"
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		utils.PushWarnings(stmtErr.Error())
		return -1, stmtErr
	}
	// fmt.Println("QUERY ", query)
	res, queryErr := stmt.Exec(
		/* 02 */ &data.DbTblName,
		/* 03 */ &data.OutOfSyncDate,
		/* 04 */ &data.RunDate,
		/* 05 */ &data.Creator,
		/* 06 */ &data.Modifier,
		/* 07 */ &data.Created,
		/* 08 */ &data.Modified,
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

// Delete deletes the DbDataIntegrity record with the given id.
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
