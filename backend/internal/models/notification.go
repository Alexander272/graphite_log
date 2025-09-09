package models

type Notification struct {
	Id      string `json:"id" db:"id"`
	RealmId string `json:"realmId" db:"realm_id"`
	Type    string `json:"type" db:"notification_type"`
	// UserId    string `json:"userId" db:"user_id"`
	MostId    string `json:"mostId" db:"most_id"`
	ChannelId string `json:"channelId" db:"channel_id"`
}

type GetNotificationDTO struct {
	Type string `json:"type" db:"notification_type" binding:"required"`
}
type GetNotificationByRealmDTO struct {
	RealmId string `json:"realmId" db:"realm_id" binding:"required"`
}

type NotificationDTO struct {
	Id      string `json:"id" db:"id"`
	RealmId string `json:"realmId" db:"realm_id" binding:"required"`
	Type    string `json:"type" db:"notification_type" binding:"required"`
	// UserId    string `json:"userId" db:"user_id" binding:"required"`
	MostId    string `json:"mostId" db:"most_id"`
	ChannelId string `json:"channelId" db:"channel_id"`
}

type DeleteNotificationDTO struct {
	Id string `json:"id" db:"id" binding:"required"`
}
