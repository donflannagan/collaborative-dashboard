package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	Email     string        `bson:"email" json:"email"`
	Username  string        `bson:"username" json:"username"`
	Password  string        `bson:"password" json:"-"`
	CreatedAt time.Time     `bson:"createdAt,omitempty" json:"createdAt"`
	UpdatedAt time.Time     `bson:"updatedAt,omitempty" json:"updatedAt"`
}

type UserResponse struct {
	ID        string    `json:"_id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (user User) ToResponse() UserResponse {
	return UserResponse{
		ID:        user.ID.Hex(),
		Email:     user.Email,
		Username:  user.Username,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}
