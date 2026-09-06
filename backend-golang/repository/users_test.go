package repository

import (
	"context"
	"errors"
	"testing"

	"github.com/donflannagan/collaborative-dashboard/backend-golang/internal/models"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func TestUserRepositoryFindByEmail(t *testing.T) {
	ctx := context.Background()
	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: testcontainers.ContainerRequest{
			Image:        "mongo:7.0",
			ExposedPorts: []string{"27017/tcp"},
			WaitingFor:   wait.ForListeningPort("27017/tcp"),
		},
		Started: true,
	})
	if err != nil {
		t.Skipf("Docker is unavailable: %v", err)
	}
	defer container.Terminate(ctx)

	endpoint, err := container.Endpoint(ctx, "")
	if err != nil {
		t.Fatal(err)
	}
	client, err := mongo.Connect(options.Client().ApplyURI("mongodb://" + endpoint))
	if err != nil {
		t.Fatal(err)
	}
	defer client.Disconnect(ctx)

	database := client.Database("collaborative-dashboard-go-tests")
	repository := NewUserRepository(database)
	user := models.User{ID: bson.NewObjectID(), Email: "alice@example.com", Username: "alice"}
	if _, err := database.Collection("users").InsertOne(ctx, user); err != nil {
		t.Fatal(err)
	}

	found, err := repository.FindByEmail(ctx, user.Email)
	if err != nil || found.Username != user.Username {
		t.Fatalf("expected user, got %#v and error %v", found, err)
	}

	_, err = repository.FindByEmail(ctx, "missing@example.com")
	if !errors.Is(err, ErrUserNotFound) {
		t.Fatalf("expected ErrUserNotFound, got %v", err)
	}
}

func TestUserRepositorySupportsUserCRUDAndLookups(t *testing.T) {
	ctx := context.Background()
	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: testcontainers.ContainerRequest{
			Image:        "mongo:7.0",
			ExposedPorts: []string{"27017/tcp"},
			WaitingFor:   wait.ForListeningPort("27017/tcp"),
		},
		Started: true,
	})
	if err != nil {
		t.Skipf("Docker is unavailable: %v", err)
	}
	defer container.Terminate(ctx)

	endpoint, err := container.Endpoint(ctx, "")
	if err != nil {
		t.Fatal(err)
	}
	client, err := mongo.Connect(options.Client().ApplyURI("mongodb://" + endpoint))
	if err != nil {
		t.Fatal(err)
	}
	defer client.Disconnect(ctx)

	repository := NewUserRepository(client.Database("collaborative-dashboard-go-crud-tests"))
	created, err := repository.Create(ctx, models.UserRequest{
		Email: "before@example.com", Username: "before", Password: "secret",
	})
	if err != nil {
		t.Fatal(err)
	}

	if found, err := repository.FindByID(ctx, created.ID.Hex()); err != nil || found.Username != "before" {
		t.Fatalf("FindByID failed: %#v, %v", found, err)
	}
	if found, err := repository.FindByUsername(ctx, "before"); err != nil || found.Email != created.Email {
		t.Fatalf("FindByUsername failed: %#v, %v", found, err)
	}
	if users, err := repository.FindAll(ctx); err != nil || len(users) != 1 {
		t.Fatalf("FindAll failed: %#v, %v", users, err)
	}

	updated, err := repository.Update(ctx, created.ID.Hex(), models.UserRequest{
		Email: "after@example.com", Username: "after", Password: "new-secret",
	})
	if err != nil || updated.Username != "after" || updated.Email != "after@example.com" {
		t.Fatalf("Update failed: %#v, %v", updated, err)
	}

	if err := repository.Delete(ctx, created.ID.Hex()); err != nil {
		t.Fatal(err)
	}
	if _, err := repository.FindByID(ctx, created.ID.Hex()); !errors.Is(err, ErrUserNotFound) {
		t.Fatalf("expected deleted user to be missing, got %v", err)
	}
}
