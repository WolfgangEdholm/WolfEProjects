package positionrepo

import (
	"fmt"

	"plan-loader/models"
	"plan-loader/utils"
)

var addFields string =
/*   01    "id, " + */
/*   02 */ "name, " +
	/* 03 */ "notes, " +
	/* 04 */ "orderOf, " +
	/* 05 */ "dancerCount, " +
	/* 06 */ "siblingId, " +
	/* 07 */ "segmentId"

var readFields string =
/*   01 */ "id, " +
	/* 02 */ "name, " +
	/* 03 */ "notes, " +
	/* 04 */ "orderOf, " +
	/* 05 */ "dancerCount, " +
	/* 06 */ "siblingId, " +
	/* 07 */ "segmentId"

var updateFields string =
/*   01    "id" */
/*   02 */ "name = ?, " +
	/* 03 */ "notes = ?, " +
	/* 04 */ "orderOf = ?, " +
	/* 05 */ "dancerCount = ?, " +
	/* 06 */ "siblingId = ?, " +
	/* 07 */ "segmentId = ?"

var table = "Position"

// GetAll gets a position record with the given id in the database.
func GetAll(segmentID int64) ([]models.DbPosition, error) {
	db := utils.DBOpen()
	defer db.Close()
	dataItems := make([]models.DbPosition, 0)
	query := "SELECT " + readFields + " FROM " + table +
		" WHERE SegmentID = ? ORDER BY OrderOf;"
	rows, queryErr := db.Query(query, segmentID)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbPosition
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.Name,
			/* 03 */ &data.Notes,
			/* 04 */ &data.OrderOf,
			/* 05 */ &data.DancerCount,
			/* 06 */ &data.SiblingID,
			/* 07 */ &data.SegmentID,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// Get gets a position record with the given id in the database.
func Get(id int64) (models.DbPosition, error) {
	var data models.DbPosition
	db := utils.DBOpen()
	defer db.Close()
	query := "SELECT " + readFields + " FROM " + table + " WHERE id = ?;"
	row := db.QueryRow(query, id)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.Name,
		/* 03 */ &data.Notes,
		/* 04 */ &data.OrderOf,
		/* 05 */ &data.DancerCount,
		/* 06 */ &data.SiblingID,
		/* 07 */ &data.SegmentID,
	)
	return data, nil
}

// Put updates a position record with the given id in the database.
func Put(id int64, data models.DbPosition) (models.DbPosition, error) {
	db := utils.DBOpen()
	defer db.Close()
	query := "UPDATE " + table + " SET " + updateFields + " WHERE id = ?"
	//fmt.Println("PUT ID=", id," SQL=", query)
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		utils.PushWarnings(stmtErr.Error())
		return data, stmtErr
	}
	defer stmt.Close()
	_, queryErr := stmt.Exec(
		/* 02 */ &data.Name,
		/* 03 */ &data.Notes,
		/* 04 */ &data.OrderOf,
		/* 05 */ &data.DancerCount,
		/* 06 */ &data.SiblingID,
		/* 07 */ &data.SegmentID,
		/* 01 */ id,
	)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return data, queryErr
	}
	data.ID = id
	return data, queryErr
}

// Post creates a new position record in the database.
func Post(data models.DbPosition) (int64, error) {
	db := utils.DBOpen()
	defer db.Close()
	query := "INSERT INTO " + table + " (" + addFields + ") VALUES(" +
		/* 02 */ "?, ?, ?, ?, ?, ? );"
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		fmt.Println("POST SQL=", query)
		utils.PushWarnings(stmtErr.Error())
		return -1, stmtErr
	}
	res, queryErr := stmt.Exec(
		/* 02 */ &data.Name,
		/* 03 */ &data.Notes,
		/* 04 */ &data.OrderOf,
		/* 05 */ &data.DancerCount,
		/* 06 */ &data.SiblingID,
		/* 07 */ &data.SegmentID,
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

// Delete deletes a position record with the given id in the database.
func Delete(id int64) error {
	db := utils.DBOpen()
	defer db.Close()

	query := "DELETE FROM " + table + " WHERE id = ?"
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

// UpdatePositionSibling updates the SiblingID of a segment record.
// If name is "" or if siblingID < 1 no update takes place
func UpdatePositionSibling(id int64, name string, siblingID int64) error {
	dbPosition, err := Get(id)
	if err != nil {
		return err
	}
	if len(name) > 0 {
		dbPosition.Name = name
	}
	if siblingID > 0 {
		dbPosition.SiblingID = siblingID
	}
	_, putErr := Put(id, dbPosition)
	return putErr
}
