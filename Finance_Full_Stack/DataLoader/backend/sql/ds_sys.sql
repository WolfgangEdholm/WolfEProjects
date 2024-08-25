DROP DATABASE IF EXISTS _ds_sys_;
CREATE DATABASE _ds_sys_;
USE _ds_sys_;


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


DROP TABLE IF EXISTS QuerySourceOutItem;
DROP TABLE IF EXISTS QuerySourceOut;

CREATE TABLE QuerySourceOut (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dbTblName VARCHAR(100) NOT NULL UNIQUE

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
);

CREATE TABLE QuerySourceOutItem (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,qsId INT NOT NULL
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
  ,FOREIGN KEY ( qsId ) REFERENCES QuerySourceOut ( id )
);


DROP TABLE IF EXISTS QuerySourceInItem;
DROP TABLE IF EXISTS QuerySourceIn;

CREATE TABLE QuerySourceIn (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dbQueryName VARCHAR(100) NOT NULL UNIQUE
  ,okDate DATETIME NOT NULL

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
);

CREATE TABLE QuerySourceInItem (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,qsId INT NOT NULL
  ,seqNum INT NOT NULL
  ,dbQueryName VARCHAR(150) NOT NULL
  ,requestColumn VARCHAR(50) NOT NULL
  ,dbTblColSource VARCHAR(150) NOT NULL
  ,type VARCHAR(50) NOT NULL
  ,fixDate DATETIME NOT NULL

  ,creator VARCHAR(50) NOT NULL
  ,modifier  VARCHAR(50) NOT NULL
  ,created DATETIME NOT NULL
  ,modified DATETIME NOT NULL
  ,FOREIGN KEY ( qsId ) REFERENCES QuerySourceIn ( id )
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
  ,dbItemName VARCHAR(150) NOT NULL
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

SET @db = 'trans';


INSERT INTO QuerySourceOut (
  dbTblName
  , creator
  , modifier
  , created
  , modified
) VALUES (
  -- Product
  CONCAT(@db, '.Product')
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
  -- User
  CONCAT(@db, '.User')
  ,'yedholm@gmail.com'
  ,'yedholm@gmail.com'
  ,'2020/01/01'
  ,'2021/06/30'
);

INSERT INTO QuerySourceOutItem (
  qsId
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
  -- Product
  1
  ,0
  ,CONCAT(@db, '.Product.id')
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
  ,CONCAT(@db, '.Product.product')
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
  ,CONCAT(@db, '.Product.managerId')
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
  2
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
  2
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
  2
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
  3
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
  3
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
  3
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
  3
  ,3
  ,CONCAT(@db, '.Sales.productId')
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
  4
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
  4
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
  4
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
  5
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
  5
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
  5
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
  6
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
  6
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
  6
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
  6
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
   -- User
  7
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
  7
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
  7
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
  7
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
  7
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
  7
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
  7
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
  7
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
  7
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
  7
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
  7
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
  7
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
  7
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

DROP TABLE IF EXISTS trans.Query1;
DROP TABLE IF EXISTS trans.Query2;
DROP TABLE IF EXISTS trans.Query3;
DROP TABLE IF EXISTS trans.Query4;
DROP TABLE IF EXISTS trans.Query5;
DROP TABLE IF EXISTS trans.Query6;
DROP TABLE IF EXISTS trans.Query7;
DROP TABLE IF EXISTS trans.Query8;
DROP TABLE IF EXISTS trans.Query9;

DROP TABLE IF EXISTS trans.Result1;
DROP TABLE IF EXISTS trans.Result2;
DROP TABLE IF EXISTS trans.Result3;
DROP TABLE IF EXISTS trans.Result4;
DROP TABLE IF EXISTS trans.Result5;
DROP TABLE IF EXISTS trans.Result6;
DROP TABLE IF EXISTS trans.Result7;
DROP TABLE IF EXISTS trans.Result8;
DROP TABLE IF EXISTS trans.Result9;

DROP TABLE IF EXISTS trans.Transformer1;
DROP TABLE IF EXISTS trans.Transformer2;
DROP TABLE IF EXISTS trans.Transformer3;
DROP TABLE IF EXISTS trans.Transformer4;
DROP TABLE IF EXISTS trans.Transformer5;
DROP TABLE IF EXISTS trans.Transformer6;
DROP TABLE IF EXISTS trans.Transformer7;
DROP TABLE IF EXISTS trans.Transformer8;
DROP TABLE IF EXISTS trans.Transformer9;
