package repository

import (
	"context"
	"errors"

	"github.com/donflannagan/collaborative-dashboard/backend-golang/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

var ErrUserNotFound = errors.New("user not found")

type UserRepository struct {
	collection *mongo.Collection
}

func NewUserRepository(database *mongo.Database) *UserRepository {
	return &UserRepository{
		collection: database.Collection("users"),
	}
}

func (repository *UserRepository) FindByEmail(
	ctx context.Context,
	email string,
) (models.User, error) {
	var user models.User

	err := repository.collection.FindOne(
		ctx,
		bson.M{"email": email},
	).Decode(&user)

	if errors.Is(err, mongo.ErrNoDocuments) {
		return models.User{}, ErrUserNotFound
	}
	if err != nil {
		return models.User{}, err
	}

	return user, nil
}
