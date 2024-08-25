package models

// DbUser is the database object representing users of the system.
type DbUser struct {
	ID int64
	FirstName string
	MiddleName string
	LastName string
	Suffix string
	DateJoined string
	Email string
	NotificationEmail string
	PhoneNumber string
	IsAdmin bool
	IsActive bool
	CanLogin bool
	Notifications bool
}

// APIUser is the database object representing users of the system.
type APIUser struct {
	ID int64 `json:"id"`
	FirstName string `json:"firstName" binding:"required"`
	MiddleName string `json:"middleName"`
	LastName string `json:"lastName" binding:"required"`
	Suffix string `json:"suffix"`
	DateJoined string `json:"dateJoined" binding:"required"`
	Email string `json:"email" binding:"required"`
	NotificationEmail string `json:"notificationEmail"`
	PhoneNumber string `json:"phoneNumber"`
	IsAdmin bool `json:"isAdmin"`
	IsActive bool `json:"isActive"`
	CanLogin bool `json:"canLogin"`
	Notifications bool `json:"notifications"`
}

// Associated Functions

// APIToDbUser converts an APIUser record to a DbUser one.
func APIToDbUser(apiUser APIUser) (DbUser, error) {
	var user DbUser
	user.ID = apiUser.ID
	user.FirstName = apiUser.FirstName
	user.MiddleName = apiUser.MiddleName
	user.LastName = apiUser.LastName
	user.Suffix = apiUser.Suffix
	user.DateJoined = apiUser.DateJoined
	user.Email = apiUser.Email
	user.NotificationEmail = apiUser.NotificationEmail
	user.PhoneNumber = apiUser.PhoneNumber
	user.IsAdmin = apiUser.IsAdmin
	user.IsActive = apiUser.IsActive
	user.CanLogin = apiUser.CanLogin
	user.Notifications = apiUser.Notifications
	return user, nil
}

// DbToAPIUser converts a DbUser record to an APIUser one.
func DbToAPIUser(dbUser DbUser) APIUser {
	var apiUser APIUser
	apiUser.ID = dbUser.ID
	apiUser.FirstName = dbUser.FirstName
	apiUser.MiddleName = dbUser.MiddleName
	apiUser.LastName = dbUser.LastName
	apiUser.Suffix = dbUser.Suffix
	apiUser.DateJoined = dbUser.DateJoined
	apiUser.Email = dbUser.Email
	apiUser.NotificationEmail = dbUser.NotificationEmail
	apiUser.PhoneNumber = dbUser.PhoneNumber
	apiUser.IsAdmin = dbUser.IsAdmin
	apiUser.IsActive = dbUser.IsActive
	apiUser.CanLogin = dbUser.CanLogin
	apiUser.Notifications = dbUser.Notifications
	return apiUser
}
