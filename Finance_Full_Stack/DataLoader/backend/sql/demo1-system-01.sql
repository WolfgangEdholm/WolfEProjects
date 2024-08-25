DROP DATABASE IF EXISTS _ts_sys_;
CREATE DATABASE _ts_sys_;
USE _ts_sys_;


DROP TABLE IF EXISTS QueryItem;
DROP TABLE IF EXISTS Query;

CREATE TABLE Query (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dbQueryName VARCHAR(50) NOT NULL UNIQUE
  ,okDate DATETIME NOT NULL
  ,outputIsTemporary BOOLEAN NOT NULL

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
);

CREATE TABLE QueryItem (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,queryId INT NOT NULL
  ,seqNum INT NOT NULL
  ,itemKind VARCHAR(50) NOT NULL
  ,itemName VARCHAR(100) NOT NULL
  ,param1 VARCHAR(150) NOT NULL
  ,param2 VARCHAR(250) NOT NULL

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
  ,FOREIGN KEY ( queryId ) REFERENCES Query ( id )
);


DROP TABLE IF EXISTS StructIntegrityItem;
DROP TABLE IF EXISTS StructIntegrity;

CREATE TABLE StructIntegrity (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dbTblName VARCHAR(100) NOT NULL UNIQUE

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
);

CREATE TABLE StructIntegrityItem (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,siId INT NOT NULL
  ,seqNum INT NOT NULL
  ,dbTblColName VARCHAR(150) NOT NULL
  ,changeDate DATETIME NOT NULL
  ,type VARCHAR(50) NOT NULL
  ,oldType VARCHAR(50) NOT NULL

  ,comment varchar(250) NOT NULL
  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
  ,FOREIGN KEY ( siId ) REFERENCES StructIntegrity ( id )
);


DROP TABLE IF EXISTS DataIntegrityItem;
DROP TABLE IF EXISTS DataIntegrity;

CREATE TABLE DataIntegrity (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dbTblName VARCHAR(100) NOT NULL UNIQUE
  ,outOfSyncDate DATETIME NOT NULL
  ,runDate DATETIME NOT NULL

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
);

CREATE TABLE DataIntegrityItem (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,diId INT NOT NULL
  ,seqNum INT NOT NULL
  ,dbTblName VARCHAR(150) NOT NULL
  ,colName VARCHAR(50) NOT NULL
  ,dbTblColSource VARCHAR(150) NOT NULL
  ,type VARCHAR(50) NOT NULL
  ,fixDate DATETIME NOT NULL
  ,outOfSyncDate DATETIME NOT NULL

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
  ,FOREIGN KEY ( diId ) REFERENCES DataIntegrity ( id )
);


-- *******************************


DROP TABLE IF EXISTS TransItem;
DROP TABLE IF EXISTS Trans;

CREATE TABLE Trans (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dbTransName VARCHAR(50) NOT NULL UNIQUE
  ,okDate DATETIME NOT NULL

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
);

CREATE TABLE TransItem (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,transId INT NOT NULL
  ,seqNum INT NOT NULL
  ,itemKind VARCHAR(50) NOT NULL
  ,itemName VARCHAR(100) NOT NULL
  ,param1 VARCHAR(150) NOT NULL
  ,param2 VARCHAR(250) NOT NULL

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
  ,FOREIGN KEY ( transId ) REFERENCES Trans ( id )
);


DROP TABLE IF EXISTS TransSourceOutItem;
DROP TABLE IF EXISTS TransSourceOut;

CREATE TABLE TransSourceOut (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dbTransName VARCHAR(100) NOT NULL UNIQUE

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
);

CREATE TABLE TransSourceOutItem (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,tsId INT NOT NULL
  ,seqNum INT NOT NULL
  ,dbTransItem VARCHAR(150) NOT NULL
  ,changeDate DATETIME NOT NULL
  ,itemKind VARCHAR(50) NOT NULL
  ,comment varchar(250) NOT NULL

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
  ,FOREIGN KEY ( tsId ) REFERENCES TransSourceOut ( id )
);


DROP TABLE IF EXISTS TransSourceInItem;
DROP TABLE IF EXISTS TransSourceIn;

CREATE TABLE TransSourceIn (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dbTransName VARCHAR(100) NOT NULL UNIQUE
  ,okDate DATETIME NOT NULL

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
);

CREATE TABLE TransSourceInItem (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,tsId INT NOT NULL
  ,seqNum INT NOT NULL
  ,dbTransName VARCHAR(150) NOT NULL
  ,itemName VARCHAR(50) NOT NULL
  ,dbItemName VARCHAR(150) NOT NULL
  ,itemKind VARCHAR(50) NOT NULL
  ,fixDate DATETIME NOT NULL

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
  ,FOREIGN KEY ( tsId ) REFERENCES TransSourceIn ( id )
);

-- *******************************

SET @db = 'demo1';


INSERT INTO StructIntegrity (
  dbTblName
  , creator
  , modifier
  , created
  , modified
) VALUES (
  -- Model
  CONCAT(@db, '.Model')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
),(
  -- ProductGroup
  CONCAT(@db, '.ProductGroup')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
),(
  -- Region
  CONCAT(@db, '.Region')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
),(
  -- Sales
  CONCAT(@db, '.Sales')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
),(
  -- SalesTransactions
  CONCAT(@db, '.SalesTransactions')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
),(
  -- StateToTerritory
  CONCAT(@db, '.StateToTerritory')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
),(
  -- Team
  CONCAT(@db, '.Team')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
),(
  -- TeamMemberBridge
  CONCAT(@db, '.TeamMemberBridge')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
),(
  -- Territory
  CONCAT(@db, '.Territory')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
),(
    -- TerritoryValues
  CONCAT(@db, '.TerritoryValues')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
),(
  -- User
  CONCAT(@db, '.User')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
);

INSERT INTO StructIntegrityItem (
  siId
  ,seqNum
  ,dbTblColName
  ,changeDate
  ,type
  ,oldType
  ,comment
  ,creator
  ,modifier
  ,created
  ,modified
) VALUES (
  -- Model
  1
  ,0
  ,CONCAT(@db, '.Model.id')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  1
  ,1
  ,CONCAT(@db, '.Model.modelName')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  1
  ,2
  ,CONCAT(@db, '.Model.listPrice')
  ,'2021/06/30 00:00:00'
  ,'double'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  1
  ,3
  ,CONCAT(@db, '.Model.productGroupId')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  -- ProductGroup
  2
  ,0
  ,CONCAT(@db, '.ProductGroup.id')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  2
  ,1
  ,CONCAT(@db, '.ProductGroup.productGroup')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  2
  ,2
  ,CONCAT(@db, '.ProductGroup.managerId')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  -- Region
  3
  ,0
  ,CONCAT(@db, '.Region.id')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  3
  ,1
  ,CONCAT(@db, '.Region.region')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  3
  ,2
  ,CONCAT(@db, '.Region.leaderId')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  -- Sales
  4
  ,0
  ,CONCAT(@db, '.Sales.id')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  4
  ,1
  ,CONCAT(@db, '.Sales.dollars')
  ,'2021/06/30 00:00:00'
  ,'double'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  4
  ,2
  ,CONCAT(@db, '.Sales.territoryId')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  4
  ,3
  ,CONCAT(@db, '.Sales.productGroupId')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  -- SalesTransaction
  5
  ,0
  ,CONCAT(@db, '.SalesTransaction.id')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  5
  ,1
  ,CONCAT(@db, '.SalesTransaction.modelId')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  5
  ,2
  ,CONCAT(@db, '.SalesTransaction.dollars')
  ,'2021/06/30 00:00:00'
  ,'double'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  5
  ,3
  ,CONCAT(@db, '.SalesTransaction.stateCode')
  ,'2021/06/30 00:00:00'
  ,'varchar(10)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  5
  ,4
  ,CONCAT(@db, '.SalesTransaction.buyerName')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  5
  ,5
  ,CONCAT(@db, '.SalesTransaction.buyerAddress')
  ,'2021/06/30 00:00:00'
  ,'varchar(100)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  5
  ,6
  ,CONCAT(@db, '.SalesTransaction.salesRep')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  -- StateToTerritory
  6
  ,0
  ,CONCAT(@db, '.StateToTerritory.stateCode')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  6
  ,1
  ,CONCAT(@db, '.StateToTerritory.stateName')
  ,'2021/06/30 00:00:00'
  ,'double'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  6
  ,2
  ,CONCAT(@db, '.StateToTerritory.territoryId')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  -- Team
  7
  ,0
  ,CONCAT(@db, '.Team.id')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  7
  ,1
  ,CONCAT(@db, '.Team.name')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  7
  ,2
  ,CONCAT(@db, '.Team.isTraveling')
  ,'2021/06/30 00:00:00'
  ,'bool'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  -- TeamMemberBridge
  8
  ,0
  ,CONCAT(@db, '.TeamMemberBridge.id')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  8
  ,1
  ,CONCAT(@db, '.TeamMemberBridge.teamId')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  8
  ,2
  ,CONCAT(@db, '.TeamMemberBridge.memberId')
  ,'2021/06/30 00:00:00'
  ,'bool'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  -- Territory
  9
  ,0
  ,CONCAT(@db, '.Territory.id')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  9
  ,1
  ,CONCAT(@db, '.Territory.territory')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  9
  ,2
  ,CONCAT(@db, '.Territory.leaderId')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  9
  ,3
  ,CONCAT(@db, '.Territory.regionId')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  -- TerritoryValues
  10
  ,0
  ,CONCAT(@db, '.TerritoryValues.id')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  10
  ,1
  ,CONCAT(@db, '.TerritoryValues.territory')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
   -- User
  11
  ,0
  ,CONCAT(@db, '.User.id')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,1
  ,CONCAT(@db, '.User.dateJoined')
  ,'2021/06/30 00:00:00'
  ,'date'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,2
  ,CONCAT(@db, '.User.firstName')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,3
  ,CONCAT(@db, '.User.middleName')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,4
  ,CONCAT(@db, '.User.lastName')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,5
  ,CONCAT(@db, '.User.suffix')
  ,'2021/06/30 00:00:00'
  ,'varchar(10)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,6
  ,CONCAT(@db, '.User.email')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,7
  ,CONCAT(@db, '.User.notificationEmail')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,8
  ,CONCAT(@db, '.User.notifications')
  ,'2021/06/30 00:00:00'
  ,'bool'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,9
  ,CONCAT(@db, '.User.phoneNumber')
  ,'2021/06/30 00:00:00'
  ,'varchar(50)'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,10
  ,CONCAT(@db, '.User.isActive')
  ,'2021/06/30 00:00:00'
  ,'bool'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,11
  ,CONCAT(@db, '.User.isAdmin')
  ,'2021/06/30 00:00:00'
  ,'bool'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
),(
  11
  ,12
  ,CONCAT(@db, '.User.canLogin')
  ,'2021/06/30 00:00:00'
  ,'int'
  ,''
  ,''
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01 00:00:00'
  ,'2021/06/30 00:00:00'
);

-- select * from QuerySourceOutItem
--   where dbTblColName = 'trans.Sales.dollars'
--   or dbTblColName = 'trans.Sales.territoryId'
--   or dbTblColName = 'trans.Sales.productId'
--   ;

DROP TABLE IF EXISTS demo1.Query1;
DROP TABLE IF EXISTS demo1.Query2;
DROP TABLE IF EXISTS demo1.Query3;
DROP TABLE IF EXISTS demo1.Query4;
DROP TABLE IF EXISTS demo1.Query5;
DROP TABLE IF EXISTS demo1.Query6;
DROP TABLE IF EXISTS demo1.Query7;
DROP TABLE IF EXISTS demo1.Query8;
DROP TABLE IF EXISTS demo1.Query9;

DROP TABLE IF EXISTS demo1.Result1;
DROP TABLE IF EXISTS demo1.Result2;
DROP TABLE IF EXISTS demo1.Result3;
DROP TABLE IF EXISTS demo1.Result4;
DROP TABLE IF EXISTS demo1.Result5;
DROP TABLE IF EXISTS demo1.Result6;
DROP TABLE IF EXISTS demo1.Result7;
DROP TABLE IF EXISTS demo1.Result8;
DROP TABLE IF EXISTS demo1.Result9;

-- DROP TABLE IF EXISTS demo1.Transformer1;
-- DROP TABLE IF EXISTS demo1.Transformer2;
-- DROP TABLE IF EXISTS demo1.Transformer3;
-- DROP TABLE IF EXISTS demo1.Transformer4;
-- DROP TABLE IF EXISTS demo1.Transformer5;
-- DROP TABLE IF EXISTS demo1.Transformer6;
-- DROP TABLE IF EXISTS demo1.Transformer7;
-- DROP TABLE IF EXISTS demo1.Transformer8;
-- DROP TABLE IF EXISTS demo1.Transformer9;

-- SalesTransaction
UPDATE StructIntegrityItem
SET changeDate = utc_timestamp
WHERE siId = 5;
