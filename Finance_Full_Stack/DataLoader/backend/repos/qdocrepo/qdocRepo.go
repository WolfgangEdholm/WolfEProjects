package qdocrepo

import (
	//"fmt"

	"plan-loader/models"
	"plan-loader/utils"
)

var addFields string =
/*   01    "id, " + */
/*   02 */ "dbQueryName, " +
	/* 03 */ "okDate, " +
	/* 04 */ "outputIsTemporary, " +
	/* 05 */ "creator, " +
	/* 06 */ "modifier, " +
	/* 07 */ "created, " +
	/* 08 */ "modified"

var readFields string =
/*   01 */ "id, " +
	/* 02 */ "dbQueryName, " +
	/* 03 */ "okDate, " +
	/* 04 */ "outputIsTemporary, " +
	/* 05 */ "creator, " +
	/* 06 */ "modifier, " +
	/* 07 */ "created, " +
	/* 08 */ "modified"

var updateFields string =
/*   01    "id" */
/*   02 */ "dbQueryName = ?, " +
	/* 03 */ "okDate = ?, " +
	/* 04 */ "outputIsTemporary = ?, " +
	/* 05 */ "creator = ?, " +
	/* 06 */ "modifier = ?, " +
	/* 07 */ "created = ?, " +
	/* 08 */ "modified = ?"

var table = ".Query"
var orderColumn = "dbQueryName"

// GetAll gets all DbQueryDocs in the database.
func GetAll() ([]models.DbQueryDoc, error) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	dataItems := make([]models.DbQueryDoc, 0)
	query := "SELECT " + readFields + " FROM " + dbTable + " ORDER BY " +
		orderColumn + ";"
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbQueryDoc
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.DbQueryName,
			/* 03 */ &data.OkDate,
			/* 04 */ &data.OutputIsTemporary,
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

// Get gets the DbQueryDoc record with the given id.
func Get(id int64) (models.DbQueryDoc, error) {
	var data models.DbQueryDoc
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "SELECT " + readFields + " FROM " + dbTable + " WHERE id = ?;"
	row := db.QueryRow(query, id)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.DbQueryName,
		/* 03 */ &data.OkDate,
		/* 04 */ &data.OutputIsTemporary,
		/* 05 */ &data.Creator,
		/* 06 */ &data.Modifier,
		/* 07 */ &data.Created,
		/* 08 */ &data.Modified,
	)
	return data, nil
}

// GetFromName gets the DbQueryDoc record with the given dbQueryName.
func GetFromName(name string) (models.DbQueryDoc, error) {
	var data models.DbQueryDoc
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "SELECT " + readFields + " FROM " + dbTable +
		" WHERE " + orderColumn + " = ?;"
	row := db.QueryRow(query, name)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.DbQueryName,
		/* 03 */ &data.OkDate,
		/* 04 */ &data.OutputIsTemporary,
		/* 05 */ &data.Creator,
		/* 06 */ &data.Modifier,
		/* 07 */ &data.Created,
		/* 08 */ &data.Modified,
	)
	return data, nil
}

// Put updates the given DbQueryDoc record.
func Put(id int64, data models.DbQueryDoc) (models.DbQueryDoc, error) {
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
		/* 02 */ &data.DbQueryName,
		/* 03 */ &data.OkDate,
		/* 04 */ &data.OutputIsTemporary,
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

// Post creates a new DbQueryDoc record.
func Post(data models.DbQueryDoc) (int64, error) {
	db := utils.DBOpen()
	defer db.Close()
	dbTable := utils.SysDirectory + table
	query := "INSERT INTO " + dbTable + " (" + addFields + ") VALUES(" +
		/* 02 */ "?, ?, ?, ?, ?, ?, ?);"
	// fmt.Println("QUERY ", query)
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		utils.PushWarnings(stmtErr.Error())
		return -1, stmtErr
	}
	res, queryErr := stmt.Exec(
		/* 02 */ &data.DbQueryName,
		/* 03 */ &data.OkDate,
		/* 04 */ &data.OutputIsTemporary,
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

// Delete deletes a DbQueryDoc record.
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
