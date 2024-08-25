package segmentrepo

import (
	//"fmt"

	"plan-loader/models"
	"plan-loader/utils"
	//"strconv"
)

var addFields string =
/*   01    "id, " + */
/*   02 */ "name, " +
	/* 03 */ "length, " +
	/* 04 */ "notes, " +
	/* 05 */ "siblingId, " +
	/* 06 */ "type"

var readFields string =
/*   01 */ "id, " +
	/* 02 */ "name, " +
	/* 03 */ "length, " +
	/* 04 */ "notes, " +
	/* 05 */ "siblingId, " +
	/* 06 */ "type"

var updateFields string =
/*   01    "id" */
/*   02 */ "name = ?, " +
	/* 03 */ "length = ?, " +
	/* 04 */ "notes = ?, " +
	/* 05 */ "siblingId = ?, " +
	/* 06 */ "type = ?"

var table = "Segment"

// GetAll gets a segment record with the given id in the database.
func GetAll() ([]models.DbSegment, error) {
	db := utils.DBOpen()
	defer db.Close()
	dataItems := make([]models.DbSegment, 0)
	query := "SELECT " + readFields + " FROM " + table + " ORDER BY name;"
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbSegment
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.Name,
			/* 03 */ &data.Length,
			/* 04 */ &data.Notes,
			/* 05 */ &data.SiblingID,
			/* 06 */ &data.Type,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// Get gets a segment record with the given id in the database.
func Get(id int64) (models.DbSegment, error) {
	var data models.DbSegment
	db := utils.DBOpen()
	defer db.Close()
	query := "SELECT " + readFields + " FROM " + table + " WHERE id = ?;"
	row := db.QueryRow(query, id)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.Name,
		/* 03 */ &data.Length,
		/* 04 */ &data.Notes,
		/* 05 */ &data.SiblingID,
		/* 06 */ &data.Type,
	)
	return data, nil
}

// Put updates a segment record with the given id in the database.
func Put(id int64, data models.DbSegment) (models.DbSegment, error) {
	db := utils.DBOpen()
	defer db.Close()
	query := "UPDATE " + table + " SET " + updateFields + " WHERE id = ?"
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		utils.PushWarnings(stmtErr.Error())
		return data, stmtErr
	}
	defer stmt.Close()
	_, queryErr := stmt.Exec(
		/* 02 */ &data.Name,
		/* 03 */ &data.Length,
		/* 04 */ &data.Notes,
		/* 05 */ &data.SiblingID,
		/* 06 */ &data.Type,
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

// Post creates a new segment record in the database.
func Post(data models.DbSegment) (int64, error) {
	db := utils.DBOpen()
	defer db.Close()
	query := "INSERT INTO " + table + " (" + addFields + ") VALUES(" +
		/* 02 */ "?, ?, ?, ?, ? );"
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		utils.PushWarnings(stmtErr.Error())
		return -1, stmtErr
	}
	res, queryErr := stmt.Exec(
		/* 02 */ &data.Name,
		/* 03 */ &data.Length,
		/* 04 */ &data.Notes,
		/* 05 */ &data.SiblingID,
		/* 06 */ &data.Type,
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

// Delete deletes a segment record with the given id in the database.
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

// CreateSegmentSibling creates a sibling segment record.
func CreateSegmentSibling(dbPosition models.DbPosition) (int64, error) {
	var dbSiblingSegment models.DbSegment
	dbSiblingSegment.Name = dbPosition.Name
	// var err error
	// dbSiblingSegment.SiblingID, err = strconv.ParseInt(apiPosition.StrID, 10, 64)
	// if err != nil {
	// 	utils.PushWarnings(fmt.Sprintf("Error converting StrID=%s to integer", apiUser.StrID))
	// 	return -1, err
	// }
	dbSiblingSegment.SiblingID = dbPosition.ID
	dbSiblingSegment.Type = models.DbSegmentTypeBallet
	id, err := Post(dbSiblingSegment)
	return id, err
}

// UpdateSegmentSibling updates the SiblingID of a segment record.
// If name is "" or if siblingID < 1 no update takes place
func UpdateSegmentSibling(id int64, name string, siblingID int64) error {
	segment, err := Get(id)
	if err != nil {
		return err
	}
	if len(name) > 0 {
		segment.Name = name
	}
	if siblingID > 0 {
		segment.SiblingID = siblingID
	}
	segment.SiblingID = siblingID
	_, putErr := Put(id, segment)
	return putErr
}
