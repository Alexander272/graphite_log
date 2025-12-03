package models

import "time"

type Channel struct {
	Id        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Type      string    `json:"type" db:"type"`
	ChannelId string    `json:"channelId" db:"channel_id"`
	Created   time.Time `json:"created" db:"created_at"`
	Updated   time.Time `json:"updated" db:"updated_at"`
}

type GetChannelsDTO struct {
	Type string `json:"type" db:"type" binding:"required"`
}

type ChannelDTO struct {
	Id        string `json:"id" db:"id"`
	Name      string `json:"name" db:"name"`
	Type      string `json:"type" db:"type"`
	ChannelId string `json:"channelId" db:"channel_id"`
}
