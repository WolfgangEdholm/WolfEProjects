SELECT
  TABLE_NAME
  ,COLUMN_NAME
  ,INDEX_NAME 
FROM information_schema.statistics
WHERE table_schema = 'rolecall_go';

SELECT *
FROM
  information_schema.KEY_COLUMN_USAGE
WHERE
  TABLE_SCHEMA = 'rolecall_go'
AND
  REFERENCED_TABLE_NAME = 'section';

SELECT
  CONCAT(table_name, '.', column_name) AS 'foreign key',
  CONCAT(referenced_table_name, '.', referenced_column_name) AS 'references',
  constraint_name AS 'constraint name'
FROM
  information_schema.key_column_usage
WHERE
  referenced_table_name IS NOT NULL
AND
    TABLE_SCHEMA = 'rolecall_go';

SELECT
  table_name AS fk_tbl
  ,column_name AS fk_col
  ,referenced_table_name AS ref_tbl
  ,referenced_column_name AS ref_col
  ,constraint_name
FROM
  information_schema.key_column_usage
WHERE
  referenced_table_name IS NOT NULL
AND
    TABLE_SCHEMA = 'rolecall_go';


SELECT a.castCount
FROM Cast a
JOIN Cast a ON a.id = b.castId
JOIN SubCast b ON b.id = c.subCastId;

SELECT a.castCount
FROM Cast a, SubCast b, CastMember c
JOIN SubCast b ON a.id = b.castId
JOIN CastMember c ON b.id = c.subCastId;

SELECT a.castCount
FROM Cast a
JOIN SubCast b ON a.id = b.castId
JOIN CastMember c ON b.id = c.subCastId;

SELECT a.castCount
FROM Cast a, SubCast b, CastMember c
where a.id = b.castId
where b.id = c.subCastId;

DROP TABLE IF EXISTS XXX;
CREATE TABLE XXX (
   id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,canLogin BIT(1) NOT NULL
);

// ,dbTblColName VARCHAR(150) NOT NULL UNIQUE -- UNIQUE creates problems

-- ******

select modelId, sum(dollars) from SalesTransactions
group by modelId;

CREATE TABLE `demo1`.`Query2` (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,`stateName` VARCHAR(250) NOT NULL,`dollars` INT NOT NULL);













UPDATE QuerySourceOutItem
SET changeDate = utc_timestamp
WHERE qsId = 3;
