package repository

import (
	"context"
	"errors"

	"github.com/donflannagan/collaborative-dashboard/backend-golang/internal/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

var ErrUserNotFound = errors.New("user not found")
var ErrInvalidUserID = errors.New("invalid user ID")

type UserRepository struct {
	collection *mongo.Collection
}

func (repository *UserRepository) FindByID(ctx context.Context, id string) (models.User, error) {
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return models.User{}, ErrInvalidUserID
	}

	return repository.findOne(ctx, bson.M{"_id": objectID})
}

func (repository *UserRepository) FindByUsername(ctx context.Context, username string) (models.User, error) {
	return repository.findOne(ctx, bson.M{"username": username})
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
	return repository.findOne(ctx, bson.M{"email": email})
}

func (repository *UserRepository) FindAll(ctx context.Context) ([]models.User, error) {
	cursor, err := repository.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err := cursor.All(ctx, &users); err != nil {
		return nil, err
	}
	return users, nil
}

func (repository *UserRepository) Create(ctx context.Context, request models.UserRequest) (models.User, error) {
	user := models.User{
		ID:       bson.NewObjectID(),
		Email:    request.Email,
		Username: request.Username,
		Password: request.Password,
	}
	_, err := repository.collection.InsertOne(ctx, user)
	return user, err
}

func (repository *UserRepository) Update(ctx context.Context, id string, request models.UserRequest) (models.User, error) {
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return models.User{}, ErrInvalidUserID
	}

	result, err := repository.collection.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{
		"$set": bson.M{
			"email":    request.Email,
			"username": request.Username,
			"password": request.Password,
		},
	})
	if err != nil {
		return models.User{}, err
	}
	if result.MatchedCount == 0 {
		return models.User{}, ErrUserNotFound
	}

	return repository.FindByID(ctx, id)
}

func (repository *UserRepository) Delete(ctx context.Context, id string) error {
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return ErrInvalidUserID
	}

	result, err := repository.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return ErrUserNotFound
	}
	return nil
}

func (repository *UserRepository) findOne(ctx context.Context, filter bson.M) (models.User, error) {
	var user models.User

	err := repository.collection.FindOne(ctx, filter).Decode(&user)

	if errors.Is(err, mongo.ErrNoDocuments) {
		return models.User{}, ErrUserNotFound
	}
	if err != nil {
		return models.User{}, err
	}

	return user, nil
}
