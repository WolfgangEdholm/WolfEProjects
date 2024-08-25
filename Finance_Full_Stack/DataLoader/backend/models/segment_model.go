package models

// APISegmentTypes describes the type of an APISegment
var APISegmentTypes = []string{"BALLET","SEGMENT","SUPER"}

// DbSegmentType describes the type of a DbSegment
type DbSegmentType int
const (
	// DbSegmentTypeBallet describes a ballet with positions
	DbSegmentTypeBallet = iota
	// DbSegmentTypeSegment describes a basic segment such as a break
	DbSegmentTypeSegment
	// DbSegmentTypeSuper describes a super ballet with ballet children
	DbSegmentTypeSuper
)

// DbPosition is the database object representing Positions in
// Ballets. A Position inside a Super Ballet Segment represents
// a Ballet and has a pointer to the Ballet record in the
// SiblingID field.
type DbPosition struct {
	ID int64
	Name string
	Notes string
	OrderOf int16
	DancerCount int16
	SiblingID int64
	SegmentID int64
}

// APIPosition is the application object representing Positions in
// Ballets. It is the same as DbPosition except the IDs are strings.
type APIPosition struct {
	ID int64 `json:"id"`
	Name string `json:"name" binding:"required"`
	Notes string `json:"notes"`
	OrderOf int16 `json:"orderOf"`
	DancerCount int16 `json:"dancerCount"`
	SiblingID int64 `json:"siblingId"`
	SegmentID int64 `json:"segmentId" binding:"required"`
}

// DbSegment is the database object representing Breaks, Ballets,
// and Super-Ballets. If the SiblingID is non zero, the Segment
// is a Ballet inside a Super Ballet and will get its orderOf
// annd segmentID information from that record.
type DbSegment struct {
	ID int64
	Name string
	Length int16
	Notes string
	SiblingID int64
	Type DbSegmentType
}

// APISegment goes to the application. In incudes the positions belonging
// to the Segment.
type APISegment struct {
	ID int64 `json:"id"`
	Name string `json:"name" binding:"required"`
	Length int16 `json:"length"`
	Notes string `json:"notes"`
	SiblingID int64 `json:"siblingId"`
	Type string `json:"type" binding:"required"`
	Positions []APIPosition `json:"positions" binding:"required"`
}

// Associated Functions

// SegmentAPITypeToDbType converts an APISegmentType (string)
// to a DbSegmentType
func SegmentAPITypeToDbType(appType string) DbSegmentType {
	var dbType DbSegmentType
	if appType == APISegmentTypes[1] {
		dbType = 1
	} else if appType == APISegmentTypes[2] {
		dbType = 2
	}
	return dbType
}

// APIToDbPosition converts an APIPosition record to a DbPosition one.
func APIToDbPosition(apiPosition APIPosition) (DbPosition, error) {
	var dbPosition DbPosition
	dbPosition.ID = apiPosition.ID
	dbPosition.Name = apiPosition.Name 
	dbPosition.Notes = apiPosition.Notes
	dbPosition.OrderOf = apiPosition.OrderOf
	dbPosition.DancerCount = apiPosition.DancerCount
	dbPosition.SiblingID = apiPosition.SiblingID
	dbPosition.SegmentID = apiPosition.SegmentID
	return dbPosition, nil
}

// DbToAPIPosition converts a DbPosition record to an APIPosition one.
func DbToAPIPosition(dbPosition DbPosition) APIPosition {
	var apiPosition APIPosition
	apiPosition.ID = dbPosition.ID
	apiPosition.Name = dbPosition.Name 
	apiPosition.Notes = dbPosition.Notes
	apiPosition.OrderOf = dbPosition.OrderOf
	apiPosition.DancerCount = dbPosition.DancerCount
	apiPosition.SiblingID = dbPosition.SiblingID
	apiPosition.SegmentID = dbPosition.SegmentID
	return apiPosition
}

// APIToDbSegment converts an APISegment record to a DbSegment one.
func APIToDbSegment(apiSegment APISegment) (DbSegment, error) {
	var dbSegment DbSegment
	dbSegment.ID = apiSegment.ID
	dbSegment.Name = apiSegment.Name 
	dbSegment.Length = apiSegment.Length
	dbSegment.Notes = apiSegment.Notes
	dbSegment.SiblingID = apiSegment.SiblingID
	dbSegment.Type = SegmentAPITypeToDbType(apiSegment.Type)
	return dbSegment, nil
}

// DbToAPISegment converts a DbSegment record to an APISegment one.
func DbToAPISegment(dbSegment DbSegment, positions []APIPosition) APISegment {
	var apiSegment APISegment
	apiSegment.ID = dbSegment.ID
	apiSegment.Name = dbSegment.Name 
	apiSegment.Length = dbSegment.Length
	apiSegment.Notes = dbSegment.Notes
	apiSegment.SiblingID = dbSegment.SiblingID
	apiSegment.Type = APISegmentTypes[dbSegment.Type]
	apiSegment.Positions = positions
	return apiSegment
}

