package userrepo

import (
	//"fmt"
	//"log"

	"plan-loader/models"
	"plan-loader/utils"
)

var addFields string =
/*   01    "id, " + */
/*   02 */ "firstName, " +
	/* 03 */ "middleName, " +
	/* 04 */ "lastName, " +
	/* 05 */ "suffix, " +
	/* 06 */ "dateJoined, " +
	/* 07 */ "email, " +
	/* 08 */ "notificationEmail, " +
	/* 09 */ "phoneNumber, " +
	/* 10 */ "isAdmin, " +
	/* 11 */ "isActive, " +
	/* 12 */ "canLogin, " +
	/* 13 */ "notifications"

var readFields string =
/*   01 */ "id, " +
	/* 02 */ "firstName, " +
	/* 03 */ "middleName, " +
	/* 04 */ "lastName, " +
	/* 05 */ "suffix, " +
	/* 06 */ "dateJoined, " +
	/* 07 */ "email, " +
	/* 08 */ "notificationEmail, " +
	/* 09 */ "phoneNumber, " +
	/* 10 */ "if(isAdmin > 0, TRUE, FALSE), " +
	/* 11 */ "if(isActive > 0, TRUE, FALSE), " +
	/* 12 */ "if(canLogin > 0, TRUE, FALSE), " +
	/* 13 */ "if(notifications > 0, TRUE, FALSE)"

var updateFields string =
/*   01    "id" */
/*   02 */ "firstName = ?, " +
	/* 03 */ "middleName = ?, " +
	/* 04 */ "lastName = ?, " +
	/* 05 */ "suffix = ?, " +
	/* 06 */ "dateJoined = ?, " +
	/* 07 */ "email = ?, " +
	/* 08 */ "notificationEmail = ?, " +
	/* 09 */ "phoneNumber = ?, " +
	/* 10 */ "isAdmin = ?, " +
	/* 11 */ "isActive = ?, " +
	/* 12 */ "canLogin = ?, " +
	/* 13 */ "notifications = ?"

var table = "User"

// GetAll gets a user record with the given id in the database.
func GetAll() ([]models.DbUser, error) {
	db := utils.DBOpen()
	defer db.Close()
	dataItems := make([]models.DbUser, 0)
	query := "SELECT " + readFields + " FROM " + table + " ORDER BY lastName, firstName, middleName;"
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}
	for rows.Next() {
		var data models.DbUser
		if err := rows.Scan(
			/* 01 */ &data.ID,
			/* 02 */ &data.FirstName,
			/* 03 */ &data.MiddleName,
			/* 04 */ &data.LastName,
			/* 05 */ &data.Suffix,
			/* 06 */ &data.DateJoined,
			/* 07 */ &data.Email,
			/* 08 */ &data.NotificationEmail,
			/* 09 */ &data.PhoneNumber,
			/* 10 */ &data.IsAdmin,
			/* 11 */ &data.IsActive,
			/* 12 */ &data.CanLogin,
			/* 13 */ &data.Notifications,
		); err != nil {
			utils.PushWarnings(err.Error())
			return dataItems, err
		}
		dataItems = append(dataItems, data)
	}
	return dataItems, nil
}

// Get gets a user record with the given id in the database.
func Get(id int64) (models.DbUser, error) {
	var data models.DbUser
	db := utils.DBOpen()
	defer db.Close()
	query := "SELECT " + readFields + " FROM " + table + " WHERE id = ?;"
	row := db.QueryRow(query, id)
	row.Scan(
		/* 01 */ &data.ID,
		/* 02 */ &data.FirstName,
		/* 03 */ &data.MiddleName,
		/* 04 */ &data.LastName,
		/* 05 */ &data.Suffix,
		/* 06 */ &data.DateJoined,
		/* 07 */ &data.Email,
		/* 08 */ &data.NotificationEmail,
		/* 09 */ &data.PhoneNumber,
		/* 10 */ &data.IsAdmin,
		/* 11 */ &data.IsActive,
		/* 12 */ &data.CanLogin,
		/* 13 */ &data.Notifications,
	)
	return data, nil
}

// Put updates a user record with the given id in the database.
func Put(id int64, data models.DbUser) (models.DbUser, error) {
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
		/* 02 */ data.FirstName,
		/* 03 */ data.MiddleName,
		/* 04 */ data.LastName,
		/* 05 */ data.Suffix,
		/* 06 */ data.DateJoined,
		/* 07 */ data.Email,
		/* 08 */ data.NotificationEmail,
		/* 09 */ data.PhoneNumber,
		/* 10 */ utils.ToTinyInt(data.IsAdmin),
		/* 11 */ utils.ToTinyInt(data.IsActive),
		/* 12 */ utils.ToTinyInt(data.CanLogin),
		/* 13 */ utils.ToTinyInt(data.Notifications),
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

// Post creates a new user record in the database.
func Post(data models.DbUser) (int64, error) {
	db := utils.DBOpen()
	defer db.Close()
	query := "INSERT INTO " + table + " (" + addFields + ") VALUES(" +
		/* 02 */ "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);" // 13
	stmt, stmtErr := db.Prepare(query)
	if stmtErr != nil {
		utils.PushWarnings(stmtErr.Error())
		return -1, stmtErr
	}
	res, queryErr := stmt.Exec(
		/* 02 */ data.FirstName,
		/* 03 */ data.MiddleName,
		/* 04 */ data.LastName,
		/* 05 */ data.Suffix,
		/* 06 */ data.DateJoined,
		/* 07 */ data.Email,
		/* 08 */ data.NotificationEmail,
		/* 09 */ data.PhoneNumber,
		/* 10 */ utils.ToTinyInt(data.IsAdmin),
		/* 11 */ utils.ToTinyInt(data.IsActive),
		/* 12 */ utils.ToTinyInt(data.CanLogin),
		/* 13 */ utils.ToTinyInt(data.Notifications),
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

// Delete deletes a user record with the given id in the database.
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
