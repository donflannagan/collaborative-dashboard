package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
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

func (fake fakeUserFinder) FindByID(context.Context, string) (models.User, error) {
	return fake.user, fake.err
}

func (fake fakeUserFinder) FindByUsername(context.Context, string) (models.User, error) {
	return fake.user, fake.err
}

func (fake fakeUserFinder) FindAll(context.Context) ([]models.User, error) {
	if fake.err != nil {
		return nil, fake.err
	}
	return []models.User{fake.user}, nil
}

func (fake fakeUserFinder) Create(context.Context, models.UserRequest) (models.User, error) {
	return fake.user, fake.err
}

func (fake fakeUserFinder) Update(context.Context, string, models.UserRequest) (models.User, error) {
	return fake.user, fake.err
}

func (fake fakeUserFinder) Delete(context.Context, string) error {
	return fake.err
}

func requestForEmail(email string) *http.Request {
	return requestForParam(http.MethodGet, "/api/users/by-email/"+email, "email", email, nil)
}

func requestForParam(method string, path string, key string, value string, body io.Reader) *http.Request {
	request := httptest.NewRequest(method, path, body)
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, &chi.Context{URLParams: chi.RouteParams{Keys: []string{key}, Values: []string{value}}}))
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

func TestUserRoutesCoverLookupListCreateUpdateAndDelete(t *testing.T) {
	user := models.User{ID: bson.NewObjectID(), Email: "alice@example.com", Username: "alice"}
	app := application{users: fakeUserFinder{user: user}}

	tests := []struct {
		name   string
		method string
		path   string
		key    string
		value  string
		body   io.Reader
		want   int
	}{
		{"id lookup", http.MethodGet, "/api/users/by-userId/" + user.ID.Hex(), "userId", user.ID.Hex(), nil, http.StatusOK},
		{"username lookup", http.MethodGet, "/api/users/by-username/alice", "username", "alice", nil, http.StatusOK},
		{"list", http.MethodGet, "/api/users", "", "", nil, http.StatusOK},
		{"create", http.MethodPost, "/api/users", "", "", bytes.NewReader([]byte(`{"email":"new@example.com","username":"new","password":"secret"}`)), http.StatusCreated},
		{"update", http.MethodPut, "/api/users/update/" + user.ID.Hex(), "userId", user.ID.Hex(), bytes.NewReader([]byte(`{"email":"new@example.com","username":"new"}`)), http.StatusOK},
		{"delete", http.MethodDelete, "/api/users/delete/" + user.ID.Hex(), "userId", user.ID.Hex(), nil, http.StatusOK},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			var request *http.Request
			if test.key == "" {
				request = httptest.NewRequest(test.method, test.path, test.body)
			} else {
				request = requestForParam(test.method, test.path, test.key, test.value, test.body)
			}
			if test.body != nil {
				request.Header.Set("Content-Type", "application/json")
			}
			response := httptest.NewRecorder()
			app.routes().ServeHTTP(response, request)
			if response.Code != test.want {
				t.Fatalf("expected status %d, got %d: %s", test.want, response.Code, response.Body.String())
			}
		})
	}
}
