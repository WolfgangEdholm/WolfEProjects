DROP DATABASE IF EXISTS demo1;
CREATE DATABASE demo1;
USE demo1;

DROP TABLE IF EXISTS User;
CREATE TABLE User (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dateJoined DATE NOT NULL
  ,firstName VARCHAR(50) NOT NULL
  ,middleName VARCHAR(50) NOT NULL
  ,lastName VARCHAR(50) NOT NULL
  ,suffix VARCHAR(10) NOT NULL
  ,email VARCHAR(50) NOT NULL UNIQUE
  ,notificationEmail VARCHAR(50) NOT NULL
  ,notifications BOOL NOT NULL
  ,phoneNumber VARCHAR(50) NOT NULL
  ,isActive BOOL NOT NULL
  ,isAdmin BOOL NOT NULL
  ,canLogin BOOL NOT NULL
);

-- 45678911234567892123456789312345678941234567895123456789612345678971234567898

INSERT INTO User (
  dateJoined
  ,firstName
  ,middleName
  ,lastName
  ,suffix
  ,email
  ,phoneNumber
  ,notificationEmail
  ,notifications
  ,isActive
  ,isAdmin
  ,canLogin
) VALUES
 ('2021-07-01', 'System', '', 'Admin', '', 'yedholm@hotmail.com', '650-799-8926', 'yedholm@hotmail.com', 0, 1, 1, 1)
,('2021-07-01', 'Yorgen', '', 'Edholm', '', 'yedholm@gmail.com', '650-799-8926', 'yedholm@hotmail.com', 0, 1, 1, 1)
,('2021-07-01', 'Jon', '', 'Affeld', '', 'jon.affeld@gmail.com', '650-248-1420', 'jon.affeld@gmail.com', 0, 1, 1, 1)
,('2021-07-01', 'Jannie', '', 'Affeld', '', 'affeld@gmail.com', '650-248-1420', 'affeld@gmail.com', 0, 1, 0, 1)
,('2021-07-01', 'Wolfgang', '', 'Edholm', '', 'wolfgangedholm@gmail.com', '650-666-5467', 'wolfgangedholm@gmail.com', 0, 1, 0, 1)
,('2021-07-01', 'Jordan', '', 'Affeld', '', 'jordan.affeld@gmail.com', '650-772-0093', 'jordan.affeld@gmail.com', 0, 1, 0, 1)
;

DROP TABLE IF EXISTS Team;
CREATE TABLE Team (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,name VARCHAR(50) NOT NULL
  ,isTraveling BOOL NOT NULL
);

DROP TABLE IF EXISTS TeamMemberBridge;
CREATE TABLE TeamMemberBridge (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,teamId INT NOT NULL
  ,memberId INT NOT NULL
  ,FOREIGN KEY ( teamId ) REFERENCES Team ( id )
  ,FOREIGN KEY ( memberId ) REFERENCES User ( id )
);

INSERT INTO Team (name, isTraveling) VALUES
('Team A', 1),
('Team B', 1),
('Team C', 0),
('Europe', 1);

INSERT INTO TeamMemberBridge (teamId, memberId) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 4),
(2, 5),
(2, 6),
(3, 1),
(3, 2),
(3, 3),
(3, 4),
(3, 5),
(3, 6),
(4, 1),
(4, 2);

DROP TABLE IF EXISTS Region;
CREATE TABLE Region (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,region VARCHAR(50) NOT NULL
  ,leaderId INT NOT NULL
  ,FOREIGN KEY ( leaderId ) REFERENCES User ( id )
);

DROP TABLE IF EXISTS Territory;
CREATE TABLE Territory (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,territory VARCHAR(50) NOT NULL
  ,leaderId INT NOT NULL
  ,regionId INT NOT NULL
  ,FOREIGN KEY ( leaderId ) REFERENCES User ( id )
  ,FOREIGN KEY ( regionId ) REFERENCES Region ( id )
);

DROP TABLE IF EXISTS ProductGroup;
CREATE TABLE ProductGroup (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,productGroup VARCHAR(50) NOT NULL
  ,managerId INT NOT NULL
  ,FOREIGN KEY ( managerId ) REFERENCES User ( id )
);

DROP TABLE IF EXISTS Sales;
CREATE TABLE Sales (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dollars DOUBLE NOT NULL
  ,territoryId INT NOT NULL
  ,productGroupId INT NOT NULL
  ,FOREIGN KEY ( territoryId ) REFERENCES Territory ( id )
  ,FOREIGN KEY ( productGroupId ) REFERENCES ProductGroup ( id )
);

INSERT INTO Region (region, leaderId) VALUES
('East', 2),
('Central', 3),
('West', 4);

INSERT INTO Territory (Territory, leaderId, regionId) VALUES
('North East', 2, 1),
('Mid Atlantic', 2, 1),
('South East', 2, 1),
('North Central', 3, 2),
('South Central', 3, 2),
('North West', 4, 3),
('South West', 4, 3);

INSERT INTO ProductGroup (productGroup, managerId) VALUES
('Conventional Cars', 4),
('Conventional Trucks', 5),
('Electric Cars', 6);

/*
INSERT INTO Sales (dollars, territoryId, productId) VALUES
(1000000, 1, 1),
(1500000, 2, 1),
(2700000, 3, 1),
(2500000, 4, 1),
(2500000, 5, 1),
(2100000, 6, 1),
(2400000, 7, 1),
(1000000, 1, 2),
(1200000, 2, 2),
(1800000, 3, 2),
(3500000, 4, 2),
(2900000, 5, 2),
(3000000, 6, 2),
(3400000, 7, 2),
(150000, 1, 3),
(200000, 2, 3),
(50000, 3, 3),
(50000, 4, 3),
(30000, 5, 3),
(100000, 6, 3),
(600000, 7, 3);
*/

DROP TABLE IF EXISTS TerritoryValues;
CREATE TABLE TerritoryValues (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,territory VARCHAR(50) NOT NULL
);

INSERT INTO TerritoryValues (territory) VALUES
('North East'),
('North Central'),
('North West');

/*
DROP TABLE IF EXISTS SalesValues;
CREATE TABLE SalesValues (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dollars DOUBLE NOT NULL
);

INSERT INTO SalesValues (dollars) VALUES
(50000),
(1000000),
(1500000),
(2500000);
*/

DROP TABLE IF EXISTS Model;
CREATE TABLE Model (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,modelName VARCHAR(50) NOT NULL
  ,listPrice DOUBLE NOT NULL
  ,productGroupId INT NOT NULL
  ,FOREIGN KEY ( productGroupId ) REFERENCES ProductGroup ( id )
);

INSERT INTO Model (productGroupId, modelName, listPrice) VALUES
(1, 'Road Runner', 20000),
(1, 'Road Runner Super', 25000),
(2, 'Heavy Duty', 18000),
(2, 'Extra Heavy Duty', 34000),
(3, 'Electro Magic', 50000),
(3, 'Electro Magic Long Distance', 70000);


DROP TABLE IF EXISTS StateToTerritory;
CREATE TABLE StateToTerritory (
  stateCode VARCHAR(10) NOT NULL PRIMARY KEY
  ,stateName VARCHAR(50) NOT NULL
  ,territoryId INT NOT NULL
  ,FOREIGN KEY ( territoryId ) REFERENCES Territory ( id )
);

INSERT INTO StateToTerritory (territoryId, stateCode, stateName) VALUES
(5, 'AL', 'Alabama'),
(6, 'AK', 'Alaska'),
(7, 'AZ', 'Arizona'),
(5, 'AR', 'Arkansas'),
(7, 'CA', 'California'),
(3, 'CZ', 'Canal Zone'),
(6, 'CO', 'Colorado'),
(1, 'CT', 'Connecticut'),
(2, 'DE', 'Delaware'),
(2, 'DC', 'District of Columbia'),
(3, 'FL', 'Florida'),
(3, 'GA', 'Georgia'),
(7, 'GU', 'Guam'),
(7, 'HI', 'Hawaii'),
(6, 'ID', 'Idaho'),
(4, 'IL', 'Illinois'),
(4, 'IN', 'Indiana'),
(4, 'IA', 'Iowa'),
(4, 'KS', 'Kansas'),
(4, 'KY', 'Kentucky'),
(5, 'LA', 'Louisiana'),
(1, 'ME', 'Maine'),
(2, 'MD', 'Maryland'),
(1, 'MA', 'Massachusetts'),
(4, 'MI', 'Michigan'),
(4, 'MN', 'Minnesota'),
(5, 'MS', 'Mississippi'),
(4, 'MO', 'Missouri'),
(6, 'MT', 'Montana'),
(4, 'NE', 'Nebraska'),
(7, 'NV', 'Nevada'),
(1, 'NH', 'New Hampshire'),
(1, 'NJ', 'New Jersey'),
(7, 'NM', 'New Mexico'),
(1, 'NY', 'New York'),
(3, 'NC', 'North Carolina'),
(4, 'ND', 'North Dakota'),
(4, 'OH', 'Ohio'),
(5, 'OK', 'Oklahoma'),
(6, 'OR', 'Oregon'),
(2, 'PA', 'Pennsylvania'),
(3, 'PR', 'Puerto Rico'),
(1, 'RI', 'Rhode Island'),
(3, 'SC', 'South Carolina'),
(4, 'SD', 'South Dakota'),
(5, 'TN', 'Tennessee'),
(5, 'TX', 'Texas'),
(6, 'UT', 'Utah'),
(1, 'VT', 'Vermont'),
(3, 'VI', 'Virgin Islands'),
(6, 'WA', 'Washington'),
(2, 'WV', 'West Virginia'),
(4, 'WI', 'Wisconsin'),
(6, 'WY', 'Wyoming');


DROP TABLE IF EXISTS SalesTransaction;
CREATE TABLE SalesTransaction (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,modelId INT NOT NULL
  ,dollars DOUBLE NOT NULL
  ,stateCode VARCHAR(10) NOT NULL
  ,buyerName VARCHAR(100) NOT NULL
  ,buyerAddress VARCHAR(50) NOT NULL
  ,salesRep VARCHAR(50) NOT NULL
  ,FOREIGN KEY ( modelId ) REFERENCES Model ( id )
  ,FOREIGN KEY ( stateCode ) REFERENCES StateToTerritory ( stateCode )
);

INSERT INTO SalesTransaction (
  modelId
  ,dollars
  ,stateCode
  ,buyerName
  ,buyerAddress
  ,salesRep
) VALUES
(4, 38000, 'ME', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(1, 18000, 'NY', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 30000, 'CA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'ME', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(6, 85000, 'TX', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 55000, 'FL', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(6, 80000, 'RI', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(6, 97000, 'NE', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 20000, 'IA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'ND', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 25000, 'SD', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'KY', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 60000, 'OR', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 62000, 'WA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(6, 90000, 'CA', 'Buyer Name', 'Buyer Address', 'Rep Info'),

(5, 60000, 'OR', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(1, 20000, 'DC', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 23000, 'WV', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 20000, 'AR', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 21000, 'MS', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 36000, 'MI', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 22000, 'MT', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 56000, 'MN', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 23000, 'IN', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 55000, 'MA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 36000, 'VT', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 35000, 'NH', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 40000, 'CO', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 39000, 'TX', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 27000, 'NM', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(1, 18000, 'UT', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(1, 19000, 'AL', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'AK', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 22000, 'AK', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 33000, 'AZ', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 60000, 'AZ', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(1, 18000, 'ID', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'WI', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 20000, 'OH', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'OH', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'PA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 56000, 'CT', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 55000, 'CA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 55000, 'FL', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'SC', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 40000, 'AK', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 22000, 'WA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 60000, 'OR', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 57000, 'WA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(6, 80000, 'CA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 54000, 'CA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 58000, 'CO', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'AZ', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 35000, 'KS', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 36000, 'PA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 52000, 'NJ', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'MO', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 34000, 'LA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 30000, 'ME', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(1, 18000, 'MS', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'MA', 'Buyer Name', 'Buyer Address', 'Rep Info'),

(4, 37000, 'ME', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 28000, 'NY', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 30000, 'CA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'MA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(6, 75500, 'FL', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 55000, 'TX', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 61000, 'RI', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(6, 87000, 'NE', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 28000, 'IA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'ND', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 25000, 'SD', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 35000, 'KY', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 65000, 'CA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 61000, 'OR', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(6, 90000, 'CA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 60000, 'OR', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(1, 20000, 'DC', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 23000, 'WV', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 20000, 'AK', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 21000, 'MS', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 36000, 'MI', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 22000, 'MT', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(6, 66000, 'MN', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 23000, 'IN', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 55000, 'MA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'NH', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 35000, 'NH', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 40000, 'CO', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 39000, 'AZ', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 27000, 'NM', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(1, 19000, 'CO', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(1, 19000, 'AL', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'AK', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 22000, 'AK', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 35000, 'AZ', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 62000, 'FL', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(1, 18000, 'ID', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'WI', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 20000, 'OH', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'OH', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'PA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 56000, 'CT', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 55000, 'CA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 55000, 'FL', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'SC', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 40000, 'AK', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(3, 22000, 'WA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 60000, 'OR', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 57000, 'WA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(6, 82000, 'CA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 55000, 'CA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 55000, 'CO', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 35000, 'AZ', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 35000, 'KS', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 36000, 'PA', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(5, 52000, 'NJ', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 38000, 'MO', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(2, 25000, 'MS', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 31000, 'ME', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(1, 18000, 'AL', 'Buyer Name', 'Buyer Address', 'Rep Info'),
(4, 31000, 'MA', 'Buyer Name', 'Buyer Address', 'Rep Info');


































SELECT a.firstName, a.lastName, a.email, c.name
FROM User a
JOIN TeamMemberBridge b ON b.memberId = a.id
JOIN Team c ON c.id = b.teamId
WHERE a.lastName in ('Affeld', 'Edholm') AND c.name = 'Team A';

SELECT a.firstName, a.lastName, a.email, b.name
FROM User a, Team b, TeamMemberBridge c
WHERE b.id = c.teamId
AND a.id = c.memberId
AND a.lastName in ('Affeld', 'Edholm') AND b.name = 'Team A';

