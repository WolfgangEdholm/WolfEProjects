DROP DATABASE IF EXISTS trans;
CREATE DATABASE trans;
USE trans;

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

DROP TABLE IF EXISTS Product;
CREATE TABLE Product (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,product VARCHAR(50) NOT NULL
  ,managerId INT NOT NULL
  ,FOREIGN KEY ( managerId ) REFERENCES User ( id )
);

DROP TABLE IF EXISTS Sales;
CREATE TABLE Sales (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,dollars DOUBLE NOT NULL
  ,territoryId INT NOT NULL
  ,productId INT NOT NULL
  ,FOREIGN KEY ( territoryId ) REFERENCES Territory ( id )
  ,FOREIGN KEY ( productId ) REFERENCES Product ( id )
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

INSERT INTO Product (product, managerId) VALUES
('Conventional Cars', 4),
('Conventional Trucks', 5),
('Electric Cars', 6);

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

DROP TABLE IF EXISTS TerritoryValues;
CREATE TABLE TerritoryValues (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
  ,territory VARCHAR(50) NOT NULL
);

INSERT INTO TerritoryValues (territory) VALUES
('North East'),
('North Central'),
('North West');

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
