package models

import (
	"testing"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestUserToResponseOmitsPasswordAndConvertsID(t *testing.T) {
	id := bson.NewObjectID()
	user := User{
		ID:       id,
		Email:    "alice@example.com",
		Username: "alice",
		Password: "secret",
	}

	response := user.ToResponse()

	if response.ID != id.Hex() {
		t.Fatalf("expected ID %q, got %q", id.Hex(), response.ID)
	}
	if response.Email != user.Email || response.Username != user.Username {
		t.Fatalf("response did not preserve safe user fields: %#v", response)
	}
}
