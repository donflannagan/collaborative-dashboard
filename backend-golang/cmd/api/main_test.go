package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/donflannagan/collaborative-dashboard/backend-golang/internal/models"
	"github.com/donflannagan/collaborative-dashboard/backend-golang/repository"
	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type fakeUserFinder struct {
	user  models.User
	err   error
	email string
}

func (fake fakeUserFinder) FindByEmail(_ context.Context, email string) (models.User, error) {
	fake.email = email
	return fake.user, fake.err
}

func requestForEmail(email string) *http.Request {
	request := httptest.NewRequest(http.MethodGet, "/api/users/by-email/"+email, nil)
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, &chi.Context{URLParams: chi.RouteParams{Keys: []string{"email"}, Values: []string{email}}}))
	return request
}

func TestGetUserByEmailReturnsUser(t *testing.T) {
	user := models.User{ID: bson.NewObjectID(), Email: "alice@example.com", Username: "alice", Password: "secret"}
	response := httptest.NewRecorder()
	app := application{users: fakeUserFinder{user: user}}

	app.getUserByEmail(response, requestForEmail(user.Email))

	if response.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", response.Code)
	}
	var body struct {
		Success bool                  `json:"success"`
		Data    []models.UserResponse `json:"data"`
		Count   int                   `json:"count"`
	}
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if !body.Success || body.Count != 1 || body.Data[0].Email != user.Email {
		t.Fatalf("unexpected response: %#v", body)
	}
}

func TestGetUserByEmailReturnsNotFoundEnvelope(t *testing.T) {
	response := httptest.NewRecorder()
	app := application{users: fakeUserFinder{err: repository.ErrUserNotFound}}

	app.getUserByEmail(response, requestForEmail("missing@example.com"))

	if response.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", response.Code)
	}
	if !strings.Contains(response.Body.String(), `"count":0`) {
		t.Fatalf("expected empty result, got %s", response.Body.String())
	}
}

func TestGetUserByEmailReturnsRepositoryError(t *testing.T) {
	response := httptest.NewRecorder()
	app := application{users: fakeUserFinder{err: errors.New("database unavailable")}}

	app.getUserByEmail(response, requestForEmail("alice@example.com"))

	if response.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", response.Code)
	}
}

func TestGetUserByEmailRejectsMissingEmail(t *testing.T) {
	response := httptest.NewRecorder()
	app := application{users: fakeUserFinder{}}
	request := httptest.NewRequest(http.MethodGet, "/api/users/by-email/", nil)

	app.getUserByEmail(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", response.Code)
	}
}
