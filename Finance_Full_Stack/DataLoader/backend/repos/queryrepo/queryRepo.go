package queryrepo

import (
	"fmt"

	"database/sql"
	"encoding/json"
	"plan-loader/models"
	"plan-loader/utils"
	"strings"
	//"strconv"
)

// GetList gets a list of all available databases on this server.
func GetList(data models.ListRequest) ([]byte, error) {
	db := utils.DBOpen()
	defer db.Close()
	listItems := make([]byte, 0)
	query := data.Request
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return listItems, queryErr
	}

	columnTypes, err := rows.ColumnTypes()
	if err != nil {
		return listItems, err
	}
	count := len(columnTypes)
	finalRows := []interface{}{}
	for rows.Next() {
		scanArgs := make([]interface{}, count)
		for i, v := range columnTypes {
			switch v.DatabaseTypeName() {
			case "VARCHAR", "TEXT", "UUID", "TIMESTAMP":
				scanArgs[i] = new(sql.NullString)
			case "BOOL":
				scanArgs[i] = new(sql.NullBool)
			case "INT4":
				scanArgs[i] = new(sql.NullInt64)
			default:
				scanArgs[i] = new(sql.NullInt32)
			}
		}
		err := rows.Scan(scanArgs...)
		if err != nil {
			utils.PushWarnings(queryErr.Error())
			return listItems, err
		}
		masterData := map[string]interface{}{}

		for i, v := range columnTypes {
			if z, ok := (scanArgs[i]).(*sql.NullBool); ok {
				masterData[v.Name()] = z.Bool
			} else if z, ok := (scanArgs[i]).(*sql.NullString); ok {
				masterData[v.Name()] = z.String
			} else if z, ok := (scanArgs[i]).(*sql.NullInt64); ok {
				masterData[v.Name()] = z.Int64
			} else if z, ok := (scanArgs[i]).(*sql.NullFloat64); ok {
				masterData[v.Name()] = z.Float64
			} else if z, ok := (scanArgs[i]).(*sql.NullInt32); ok {
				masterData[v.Name()] = z.Int32
			} else {
				masterData[v.Name()] = scanArgs[i]
			}
		}
		//fmt.Printf("\n");
		finalRows = append(finalRows, masterData)
	}

	result, err := json.Marshal(finalRows)
	if err != nil {
		utils.PushWarnings(queryErr.Error())
		return result, err
	}
	//fmt.Println("RESULT", string(result))
	return result, err
}

// GetQuery gets a list of all available databases on this server.
func GetQuery(data models.QueryRequest) ([]byte, error) {
	db := utils.DBOpen()
	defer db.Close()
	dataItems := make([]byte, 0)
	query := data.Request
	rows, queryErr := db.Query(query)
	if queryErr != nil {
		utils.PushWarnings(queryErr.Error())
		return dataItems, queryErr
	}

	columnTypes, err := rows.ColumnTypes()
	if err != nil {
		return dataItems, err
	}
	count := len(columnTypes)
	finalRows := []interface{}{}
	for rows.Next() {
		scanArgs := make([]interface{}, count)
		for i, v := range columnTypes {
			//fmt.Printf("%d: type=%s\n", i, v.DatabaseTypeName());
			switch v.DatabaseTypeName() {
			case "VARCHAR", "TEXT", "UUID", "TIMESTAMP":
				scanArgs[i] = new(sql.NullString)
			case "BOOL":
				scanArgs[i] = new(sql.NullBool)
			case "INT4":
				scanArgs[i] = new(sql.NullInt64)
			default:
				scanArgs[i] = new(sql.NullInt32)
			}
		}
		err := rows.Scan(scanArgs...)
		if err != nil {
			utils.PushWarnings(queryErr.Error())
			return dataItems, err
		}
		masterData := map[string]interface{}{}

		for i, v := range columnTypes {
			if z, ok := (scanArgs[i]).(*sql.NullBool); ok {
				masterData[v.Name()] = z.Bool
			} else if z, ok := (scanArgs[i]).(*sql.NullString); ok {
				masterData[v.Name()] = z.String
				//fmt.Printf("Convert %d String ", i)
			} else if z, ok := (scanArgs[i]).(*sql.NullInt64); ok {
				masterData[v.Name()] = z.Int64
			} else if z, ok := (scanArgs[i]).(*sql.NullFloat64); ok {
				masterData[v.Name()] = z.Float64
			} else if z, ok := (scanArgs[i]).(*sql.NullInt32); ok {
				masterData[v.Name()] = z.Int32
				//fmt.Printf("Convert %d Int32 ", i)
			} else if z, ok := (scanArgs[i]).(*sql.NullBool); ok {
				masterData[v.Name()] = z.Bool
				//fmt.Printf("Convert %d Bool ", i)
			} else {
				masterData[v.Name()] = scanArgs[i]
			}
		}
		//fmt.Printf("\n");
		finalRows = append(finalRows, masterData)
	}

	result, err := json.Marshal(finalRows)
	if err != nil {
		utils.PushWarnings(queryErr.Error())
		return result, err
	}
	//fmt.Println("RESULT", string(result))
	return result, err
}

// WriteSql
func WriteSql(saveData models.QuerySave) error {
	db := utils.DBOpen()
	defer db.Close()
	if saveData.WriteMode == "write" {
		fmt.Printf("DELETE %s\n", saveData.DeleteSql)
		_, deleteErr := db.Query(saveData.DeleteSql)
		if deleteErr != nil {
			utils.PushWarnings(deleteErr.Error())
			return deleteErr
		}
		var cs strings.Builder
		for _, v := range saveData.CreateSql {
			cs.WriteString(v)
		}
		fmt.Printf("CREATE %s\n", cs.String())
		_, createErr := db.Query(cs.String())
		if createErr != nil {
			utils.PushWarnings(createErr.Error())
			return createErr
		}
	}
	var ss strings.Builder
	for _, v := range saveData.SaveSql {
		ss.WriteString(v)
	}
	fmt.Printf("SAVE %s\n", ss.String())
	_, saveErr := db.Query(ss.String())
	if saveErr != nil {
		utils.PushWarnings(saveErr.Error())
		return saveErr
	}
	return nil
}
