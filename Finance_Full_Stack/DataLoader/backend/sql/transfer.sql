/* SQL make a copy of the rolcall_db database in the database rolecall_new. */
/* Build Tables */
DROP DATABASE IF EXISTS rolecall_go2;
CREATE DATABASE rolecall_go2;
USE rolecall_go2;

DROP TABLE IF EXISTS User;
CREATE TABLE User (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,canLogin BOOL NOT NULL
   ,comments VARCHAR(255) NOT NULL
   ,dateJoined DATE NOT NULL
   ,email VARCHAR(50) NOT NULL UNIQUE
   ,emergencyContactName VARCHAR(100) NOT NULL
   ,emergencyContactNumber VARCHAR(50) NOT NULL
   ,firstName VARCHAR(50) NOT NULL
   ,isActive BOOL NOT NULL
   ,isAdmin BOOL NOT NULL
   ,isChoreographer BOOL NOT NULL
   ,isDancer BOOL NOT NULL
   ,isOther BOOL NOT NULL
   ,lastName VARCHAR(50) NOT NULL
   ,manageBallets BOOL NOT NULL
   ,manageCasts BOOL NOT NULL
   ,managePerformances BOOL NOT NULL
   ,manageRoles BOOL NOT NULL
   ,manageRules BOOL NOT NULL
   ,middleName VARCHAR(50) NOT NULL
   ,notificationEmail VARCHAR(50) NOT NULL
   ,notifications BOOL NOT NULL
   ,phoneNumber VARCHAR(50) NOT NULL
   ,pictureFile VARCHAR(50) NOT NULL
   ,suffix VARCHAR(10) NOT NULL
);

DROP TABLE IF EXISTS User_Id_Lookup;
CREATE TABLE User_Id_Lookup (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,oldId INT(11) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS Segment;
CREATE TABLE Segment (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,length INT(11) NOT NULL
   ,name VARCHAR(100) NOT NULL
   ,notes VARCHAR(255) NOT NULL
   ,siblingId INT(11) NOT NULL
   ,type INT(11) NOT NULL
);

DROP TABLE IF EXISTS Segment_Id_Lookup;
CREATE TABLE Segment_Id_Lookup (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,oldId INT(11) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS Position;
CREATE TABLE Position (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,name VARCHAR(100) NOT NULL
   ,notes VARCHAR(255) NOT NULL
   ,orderOf int(11) NOT NULL
   ,siblingId INT(11) NOT NULL
   ,dancerCount INT(11) NOT NULL
   ,segmentId INT(11) NOT NULL
   ,FOREIGN KEY ( segmentId ) REFERENCES Segment ( id )
);

DROP TABLE IF EXISTS Position_Id_Lookup;
CREATE TABLE Position_Id_Lookup (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,oldId INT(11) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS Cast;
CREATE TABLE Cast (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,castCount INT(11) NOT NULL
   ,name VARCHAR(100) NOT NULL
   ,notes VARCHAR(255) NOT NULL
   ,segmentId INT(11) NOT NULL
   ,FOREIGN KEY ( segmentId ) REFERENCES Segment ( id )
);

DROP TABLE IF EXISTS Cast_Id_Lookup;
CREATE TABLE Cast_Id_Lookup (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,oldId INT(11) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS SubCast;
CREATE TABLE SubCast (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,castNumber INT(11) NOT NULL   
   ,dancerCount INT(11) NOT NULL
   ,castId INT(11) NOT NULL
   ,positionId INT(11) NOT NULL
   ,FOREIGN KEY ( castId ) REFERENCES Cast ( id )
   ,FOREIGN KEY ( positionId ) REFERENCES Position ( id )
);

DROP TABLE IF EXISTS SubCast_Id_Lookup;
CREATE TABLE SubCast_Id_Lookup (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,oldId INT(11) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS CastMember;
CREATE TABLE CastMember (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,orderOf INT(11) NOT NULL
   ,subCastId INT(11) NOT NULL
   ,userId INT(11) NOT NULL
   ,FOREIGN KEY ( subCastId ) REFERENCES SubCast ( id )
   ,FOREIGN KEY ( userId ) REFERENCES User ( id )
);

DROP TABLE IF EXISTS CastMember_Id_Lookup;
CREATE TABLE CastMember_Id_Lookup (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,oldId INT(11) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS Performance;
CREATE TABLE Performance (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,city VARCHAR(100) NOT NULL
   ,country VARCHAR(100) NOT NULL
   ,dateTime DATETIME NOT NULL
   ,description VARCHAR(1023) NOT NULL
   ,state VARCHAR(100) NOT NULL
   ,status VARCHAR(100) NOT NULL
   ,title VARCHAR(100) NOT NULL
   ,venue VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS Performance_Id_Lookup;
CREATE TABLE Performance_Id_Lookup (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,oldId INT(11) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS PerformanceSegment;
CREATE TABLE PerformanceSegment (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,primaryCast INT(11) NOT NULL
   ,segmentPosition INT(11) NOT NULL
   ,performanceid INT(11) NOT NULL
   ,segmentId INT(11) NOT NULL
   ,FOREIGN KEY ( performanceId ) REFERENCES Performance ( id )
   ,FOREIGN KEY ( segmentId ) REFERENCES Segment ( id )
);

DROP TABLE IF EXISTS PerformanceSegment_Id_Lookup;
CREATE TABLE PerformanceSegment_Id_Lookup (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,oldId INT(11) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS PerformanceCastMember;
CREATE TABLE PerformanceCastMember (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,castNumber INT(11) NOT NULL
   ,orderOf INT(11) NOT NULL
   ,performing BIT(1) NOT NULL
   ,performanceId INT(11) NOT NULL
   ,userId INT(11) NOT NULL
   ,performanceSegmentId INT(11) NOT NULL
   ,positionId INT(11) NOT NULL
   ,FOREIGN KEY ( performanceId ) REFERENCES Performance ( id )
   ,FOREIGN KEY ( userId ) REFERENCES User ( id )
   ,FOREIGN KEY ( performanceSegmentId ) REFERENCES PerformanceSegment ( id )
   ,FOREIGN KEY ( positionId ) REFERENCES Position ( id )
);

DROP TABLE IF EXISTS PerformanceCastMember_Id_Lookup;
CREATE TABLE PerformanceCastMember_Id_Lookup (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,oldId INT(11) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS Unavailability;
CREATE TABLE Unavailability (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,description VARCHAR(255) NOT NULL
   ,endDate DATE NOT NULL
   ,startDate DATE NOT NULL
   ,userId INT(11) NOT NULL
   ,FOREIGN KEY ( userId ) REFERENCES User ( id )
);

DROP TABLE IF EXISTS Unavailability_Id_Lookup;
CREATE TABLE Unavailability_Id_Lookup (
   id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY
   ,oldId INT(11) NOT NULL UNIQUE
);

/* Move the data */

/* Logic: Create id lookup tables with auto increment ids.
 * The source table is sorted the way we want it ->
 * The new table's ids will be sorted the way we want.
 */

INSERT INTO User_Id_Lookup (
   oldId
)
SELECT
   id
FROM rolecall_db.User
ORDER by lastName, firstName;

INSERT INTO User (
   id
   ,canLogin
   ,comments
   ,dateJoined
   ,email
   ,emergencyContactName
   ,emergencyContactNumber
   ,firstName
   ,isActive
   ,isAdmin
   ,isChoreographer
   ,isDancer
   ,isOther
   ,lastName
   ,manageBallets
   ,manageCasts
   ,managePerformances
   ,manageRoles
   ,manageRules
   ,middleName
   ,notificationEmail
   ,notifications
   ,phoneNumber
   ,pictureFile
   ,suffix
)
SELECT
   il.id
   ,u.canLogin
   ,COALESCE(u.comments, '')
   ,COALESCE(u.dateJoined, '1900-01-01')
   ,u.email
   ,COALESCE(u.emergencyContactName, '')
   ,COALESCE(u.emergencyContactNumber, '')
   ,u.firstName
   ,u.isActive
   ,u.isAdmin
   ,u.isChoreographer
   ,u.isDancer
   ,u.isOther
   ,u.lastName
   ,u.managePieces
   ,u.manageCasts
   ,u.managePerformances
   ,u.manageRoles
   ,u.manageRules
   ,COALESCE(u.middleName, '')
   ,COALESCE(u.notificationEmail, '')
   ,u.notifications
   ,COALESCE(u.phoneNumber, '')
   ,COALESCE(u.pictureFile, '')
   ,COALESCE(u.suffix, '')
FROM rolecall_db.User u
JOIN User_Id_Lookup il ON u.id = il.oldId
ORDER by lastName, firstName;

INSERT INTO Segment_Id_Lookup (
   oldId
)
SELECT
   id
FROM rolecall_db.Section
ORDER by name;

/* Moved up to suppert siblingId in Segment */
INSERT INTO Position_Id_Lookup (
   oldId
)
SELECT
   p.id
FROM rolecall_db.Position p
JOIN rolecall_db.Section s ON p.section_id = s.id
ORDER by s.name, p.orderOf;

INSERT INTO Segment (
   id
   ,length
   ,name
   ,notes
   ,siblingId
   ,type
)
SELECT
   il_s.id
   ,COALESCE(s.length, 0)
   ,s.name
   ,COALESCE(s.notes, '')
   ,COALESCE(il_p.id, 0)
   ,COALESCE(s.type, 0)
FROM rolecall_db.Section s
JOIN Segment_Id_Lookup il_s ON s.id = il_s.oldId
LEFT JOIN Position_Id_Lookup il_p ON s.siblingId = il_p.oldId
ORDER by name;

INSERT INTO Position (
   id
   ,name
   ,notes
   ,orderOf
   ,siblingId
   ,dancerCount
   ,segmentId
)
SELECT
   il_p.id
   ,p.name
   ,COALESCE(p.notes, '')
   ,p.orderOf
   ,COALESCE(il_s2.id,0)
   ,COALESCE(p.size, 0)
   ,il_s.id
FROM rolecall_db.Position p
JOIN rolecall_db.Section s ON p.section_id = s.id
JOIN Position_Id_Lookup il_p On p.id = il_p.oldId
JOIN Segment_Id_Lookup il_s On p.section_id = il_s.oldId
LEFT JOIN Segment_Id_Lookup il_s2 On p.siblingId = il_s2.oldId
ORDER by s.name, p.orderOf;

INSERT INTO Cast_Id_Lookup (
   oldId
)
SELECT
   c.id
FROM rolecall_db.Cast c
JOIN rolecall_db.Section s ON c.section_id = s.id
ORDER by s.name, c.name;

INSERT INTO Cast (
   id
   ,castCount
   ,name
   ,notes
   ,segmentId
)
SELECT
   il_c.id
   ,0
   ,c.name
   ,COALESCE(c.notes, '')
   ,il_s.id
FROM rolecall_db.Cast c
JOIN rolecall_db.Section s ON c.section_id = s.id
JOIN Cast_Id_Lookup il_c On c.id = il_c.oldId
JOIN Segment_Id_Lookup il_s On c.section_id = il_s.oldId
ORDER by s.name, c.name;

INSERT INTO SubCast_Id_Lookup (
   oldId
)
SELECT
   sc.id
FROM rolecall_db.SubCast sc
JOIN rolecall_db.Cast c ON sc.cast_id = c.id
JOIN rolecall_db.Section s ON c.section_id = s.id
JOIN rolecall_db.Position p ON sc.position_id = p.id
ORDER by s.name, c.name, p.orderOf, sc.castNumber;

INSERT INTO SubCast (
   id
   ,castNumber
   ,dancerCount
   ,castId
   ,positionId
)
SELECT
   il_sc.id
   ,sc.castNumber
   ,0
   ,il_c.id
   ,il_p.id
FROM rolecall_db.SubCast sc
JOIN rolecall_db.Cast c ON sc.cast_id = c.id
JOIN rolecall_db.Section s ON c.section_id = s.id
JOIN rolecall_db.Position p ON sc.position_id = p.id
JOIN SubCast_Id_Lookup il_sc ON sc.id = il_sc.oldId
JOIN Cast_Id_Lookup il_c ON sc.cast_id = il_c.oldId
JOIN Position_Id_Lookup il_p ON sc.position_id = il_p.oldId
ORDER by s.name, c.name, p.orderOf, sc.castNumber;

INSERT INTO CastMember_Id_Lookup (
   oldId
)
SELECT
   cm.id
FROM rolecall_db.CastMember cm
JOIN rolecall_db.SubCast sc ON cm.cast_id = sc.id
JOIN rolecall_db.Cast c ON sc.cast_id = c.id
JOIN rolecall_db.Section s ON c.section_id = s.id
ORDER by s.name, c.name, cm.orderOf;

INSERT INTO CastMember (
   id
   ,orderOf
   ,subCastId
   ,userId
)
SELECT
   il_cm.id
   ,cm.orderOf
   ,il_sc.id
   ,il_u.id
FROM rolecall_db.CastMember cm
JOIN rolecall_db.SubCast sc ON cm.cast_id = sc.id
JOIN rolecall_db.Cast c ON sc.cast_id = c.id
JOIN rolecall_db.Section s ON c.section_id = s.id
JOIN CastMember_Id_Lookup il_cm ON cm.id = il_cm.oldId
JOIN SubCast_Id_Lookup il_sc ON cm.cast_id = il_sc.oldId
JOIN User_Id_Lookup il_u ON cm.user_id = il_u.oldId
ORDER by s.name, c.name, cm.orderOf, sc.castNumber;

INSERT INTO Performance_Id_Lookup (
   oldId
)
SELECT
   id
FROM rolecall_db.Performance
ORDER by dateTime;

INSERT INTO Performance (
   id
   ,city
   ,country
   ,dateTime
   ,description
   ,state
   ,status
   ,title
   ,venue
)
SELECT
   il_pf.id
   ,pf.city
   ,pf.country
   ,pf.dateTime
   ,COALESCE(pf.description, '')
   ,pf.state
   ,pf.status
   ,pf.title
   ,pf.venue
FROM rolecall_db.Performance pf
JOIN Performance_Id_Lookup il_pf ON pf.id = il_pf.oldId
ORDER by pf.dateTime;

INSERT INTO PerformanceSegment_Id_Lookup (
   oldId
)
SELECT
   ps.id
FROM rolecall_db.PerformanceSection ps
JOIN rolecall_db.Performance pf ON ps.performance_id = pf.id
ORDER by pf.dateTime, ps.sectionPosition;

INSERT INTO PerformanceSegment (
   id
   ,primaryCast
   ,segmentPosition
   ,performanceId
   ,segmentId
)
SELECT
   il_ps.id
   ,COALESCE(ps.primaryCast, 0)
   ,ps.sectionPosition
   ,il_pf.id
   ,il_s.id
FROM rolecall_db.PerformanceSection ps
JOIN rolecall_db.Performance pf ON ps.performance_id = pf.id
JOIN PerformanceSegment_Id_Lookup il_ps ON ps.id = il_ps.oldId
JOIN Performance_Id_Lookup il_pf ON ps.performance_id = il_pf.oldId
JOIN Segment_Id_Lookup il_s ON ps.section_id = il_s.oldId
ORDER by pf.dateTime, ps.sectionPosition;

INSERT INTO PerformanceCastMember_Id_Lookup (
   oldId
)
SELECT
   pcm.id
FROM rolecall_db.PerformanceCastMember pcm
JOIN rolecall_db.Performance pf ON pcm.performance_id = pf.id
JOIN rolecall_db.PerformanceSection ps ON pcm.performanceSection_id = ps.id
ORDER by pf.dateTime, ps.sectionPosition, pcm.orderOf, pcm.castNumber;

INSERT INTO PerformanceCastMember (
   id
   ,castNumber
   ,orderOf
   ,performing
   ,performanceId
   ,userId
   ,performanceSegmentId
   ,positionId
)
SELECT
   il_pcm.id
   ,pcm.castNumber
   ,pcm.orderOf
   ,pcm.performing
   ,il_pf.id
   ,il_u.id
   ,il_ps.id
   ,il_p.id
FROM rolecall_db.PerformanceCastMember pcm
JOIN rolecall_db.Performance pf ON pcm.performance_id = pf.id
JOIN rolecall_db.PerformanceSection ps ON pcm.performanceSection_id = ps.id
JOIN PerformanceCastMember_Id_Lookup il_pcm ON pcm.id = il_pcm.oldId
JOIN Performance_Id_Lookup il_pf ON ps.performance_id = il_pf.oldId
JOIN User_Id_Lookup il_u ON pcm.user_id = il_u.oldId
JOIN PerformanceSegment_Id_Lookup il_ps ON pcm.performanceSection_id = il_ps.oldId
JOIN Position_Id_Lookup il_p ON pcm.position_id = il_p.oldId
ORDER by pf.dateTime, ps.sectionPosition, pcm.orderOf, pcm.castNumber;

/* Guarntees that Max(id) later doesn't return NULL */
INSERT INTO Unavailability_Id_Lookup (
     oldId
)
VALUES ( 1 );
INSERT INTO Unavailability_Id_Lookup (
   oldId
)
SELECT
   ua.id
FROM rolecall_db.Unavailability ua
JOIN rolecall_db.User u ON ua.user_id = u.id
ORDER by startDate, u.lastName, u.firstName;

INSERT INTO Unavailability (
   id
   ,description
   ,endDate
   ,startDate
   ,userId
)
SELECT
   il_ua.id
   ,ua.description
   ,COALESCE(ua.endDate, '1900-01-01')
   ,COALESCE(ua.startDate, '1900-01-01')
   ,il_u.id
FROM rolecall_db.Unavailability ua
JOIN rolecall_db.User u ON ua.user_id = u.id
JOIN Unavailability_Id_Lookup il_ua ON ua.id = il_ua.oldId
JOIN User_Id_Lookup il_u ON ua.user_id = il_u.oldId
ORDER by startDate, u.lastName, u.firstName;

DROP TABLE IF EXISTS MaxIds;
CREATE TABLE MaxIds (
  Cast INT
  ,CastMember INT(11)
  ,Performance INT(11)
  ,PerformanceCastMember INT(11)
  ,PerformanceSegment INT(11)
  ,Position INT(11)
  ,Segment INT(11)
  ,SubCast INT(11)
  ,Unavailability INT(11)
  ,User INT(11)
);

INSERT INTO MaxIds(
  Cast
  ,CastMember
  ,Performance
  ,PerformanceCastMember
  ,PerformanceSegment
  ,Position
  ,Segment
  ,SubCast
  ,Unavailability
  ,User
)
SELECT
  Max(a.id)
  ,Max(b.id)
  ,Max(c.id)
  ,Max(d.id)
  ,Max(e.id)
  ,Max(f.id)
  ,Max(g.id)
  ,Max(h.id)
  ,Max(i.id)
  ,Max(j.id)
FROM
  Cast_Id_Lookup a,
  CastMember_Id_Lookup b,
  Performance_Id_Lookup c,
  PerformanceCastMember_Id_Lookup d,
  PerformanceSegment_Id_Lookup e,
  Position_Id_Lookup f,
  Segment_Id_Lookup g,
  SubCast_Id_Lookup h,
  Unavailability_Id_Lookup i,
  User_Id_Lookup j;

  select * from MaxIds;

/* hibernate_sequence has many values not just one
INSERT INTO hibernate_sequence (
   next_val
)
SELECT 1 + GREATEST (
  Cast,
  ,CastMember
  ,Performance
  ,PerformanceCastMember
  ,PerformanceSegment
  ,Position
  ,Segment
  ,SubCast
  ,Unavailability
  ,User
)
FROM MaxIds;
*/

// Extra work tables for more interesting queries

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
(1, 4),
(1, 5),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(2, 16),
(2, 17),
(2, 18),
(2, 19),
(2, 20),
(2, 21),
(2, 22),
(2, 23),
(2, 24),
(2, 25),
(2, 26),
(2, 27),
(2, 28),
(2, 29),
(2, 30),
(3, 1),
(3, 3),
(3, 5),
(3, 7),
(3, 9),
(3, 11),
(3, 13),
(3, 15),
(3, 17),
(3, 19),
(3, 21),
(3, 23),
(3, 25),
(3, 27),
(3, 29),
(4, 2),
(4, 4),
(4, 6),
(4, 8),
(4, 10),
(4, 12),
(4, 14),
(4, 16),
(4, 18),
(4, 20),
(4, 22),
(4, 24),
(4, 26),
(4, 28),
(4, 30);

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
('North East', 4, 1),
('Mid Atlantic', 5, 1),
('South East', 7, 1),
('North Central', 8, 2),
('South Central', 9, 2),
('North West', 10, 3),
('South West', 11, 3);

INSERT INTO Product (product, managerId) VALUES
('Conventional Cars', 12),
('Conventional Trucks', 13),
('Electric Cars', 14);

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

/* delete lookup tables */

DROP TABLE IF EXISTS Cast_Id_Lookup;
DROP TABLE IF EXISTS CastMember_Id_Lookup;
DROP TABLE IF EXISTS Performance_Id_Lookup;
DROP TABLE IF EXISTS PerformanceCastMember_Id_Lookup;
DROP TABLE IF EXISTS PerformanceSegment_Id_Lookup;
DROP TABLE IF EXISTS Position_Id_Lookup;
DROP TABLE IF EXISTS Segment_Id_Lookup;
DROP TABLE IF EXISTS SubCast_Id_Lookup;
DROP TABLE IF EXISTS Unavailability_Id_Lookup;
DROP TABLE IF EXISTS User_Id_Lookup;


SELECT a.firstName, a.lastName, a.email, b.name
FROM User a
JOIN TeamMemberBridge c ON b.id = c.teamId
JOIN TeamMemberBridge c ON a.id = c.memberId
WHERE a.lastName in ('Affeld', 'Edholm') AND b.name = 'Team A';