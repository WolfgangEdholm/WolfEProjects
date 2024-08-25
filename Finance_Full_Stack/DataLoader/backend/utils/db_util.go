package utils

import (
	"database/sql"
	"fmt"
)

var currDriver = ""
var currUser = ""
var currPassword = ""
var currDbHost = ""
var currDbPort = ""
var currDbName = ""

var dsn string = ""

var SysDirectory string = "" 

// DBInitialize initializes the database connection.
func DBInitialize(dbDriver, dbUser, dbPassword, dbHost, dbPort,
		dbName string) {
	currDriver = dbDriver
	currUser = dbUser
	currPassword = dbPassword
	currDbHost = dbHost
	currDbPort = dbPort
	currDbName = dbName;
	dsn = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", dbUser, dbPassword,
			dbHost, dbPort, dbName)			
	fmt.Println("Connection String:", dsn)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		dsn = ""
		panic(err.Error())
	}	
	err = db.Ping()
	if err != nil {
		dsn = ""
		panic(err.Error())
	}	
	defer db.Close()
}

// DBOpen sets up the database connection.
func DBOpen() *sql.DB {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		dsn = ""
		panic(err.Error())
	}	
	return db
}

// SetCurrentDatabase changes the current database
func SetCurrentDatabase(dbName string) {
	DBInitialize(currDriver, currUser, currPassword, currDbHost,
		currDbPort, dbName);
}

// ToTinyInt converts a boolean to an integer to be compativle with MySQL
func ToTinyInt(input bool) int {
	if input {
		return 1
	}
	return 0
}
