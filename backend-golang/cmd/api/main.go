package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/donflannagan/collaborative-dashboard/backend-golang/internal/config"
	"github.com/donflannagan/collaborative-dashboard/backend-golang/internal/models"
	"github.com/donflannagan/collaborative-dashboard/backend-golang/repository"
	"github.com/go-chi/chi/v5"
)

type application struct {
	users userFinder
}

type userFinder interface {
	FindByID(context.Context, string) (models.User, error)
	FindByUsername(context.Context, string) (models.User, error)
	FindByEmail(context.Context, string) (models.User, error)
	FindAll(context.Context) ([]models.User, error)
	Create(context.Context, models.UserRequest) (models.User, error)
	Update(context.Context, string, models.UserRequest) (models.User, error)
	Delete(context.Context, string) error
}

func main() {
	ctx := context.Background()

	client, database, err := config.ConnectMongo(ctx)
	if err != nil {
		log.Fatalf("connect to MongoDB: %v", err)
	}
	defer func() {
		if err := client.Disconnect(ctx); err != nil {
			log.Printf("disconnect from MongoDB: %v", err)
		}
	}()

	app := application{
		users: repository.NewUserRepository(database),
	}

	router := app.routes()

	server := &http.Server{
		Addr:    ":5004",
		Handler: router,
	}

	log.Println("Go API listening on http://localhost:5004")
	log.Fatal(server.ListenAndServe())
}

func (app application) routes() http.Handler {
	router := chi.NewRouter()

	router.Get("/health", func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Content-Type", "application/json")
		_, _ = writer.Write([]byte(`{"status":"ok","service":"golang-backend"}`))
	})

	router.Get("/api/users/by-email/{email}", app.getUserByEmail)
	router.Get("/api/users/by-userId/{userId}", app.getUserByID)
	router.Get("/api/users/by-username/{username}", app.getUserByUsername)
	router.Get("/api/users", app.getUsers)
	router.Post("/api/users", app.createUser)
	router.Put("/api/users/update/{userId}", app.updateUser)
	router.Delete("/api/users/delete/{userId}", app.deleteUser)

	return router
}

func (app application) getUserByEmail(
	writer http.ResponseWriter,
	request *http.Request,
) {
	email := chi.URLParam(request, "email")
	if email == "" {
		writeJSON(writer, http.StatusBadRequest, map[string]any{
			"success": false,
			"error":   "Email is required",
		})
		return
	}

	user, err := app.users.FindByEmail(request.Context(), email)
	if errors.Is(err, repository.ErrUserNotFound) {
		writeUserList(writer, http.StatusOK, false, nil)
		return
	}
	if errors.Is(err, repository.ErrInvalidUserID) {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"success": false, "error": "Invalid User ID format"})
		return
	}
	if err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{
			"success": false,
			"error":   "Unable to retrieve user",
		})
		return
	}

	writeUserList(writer, http.StatusOK, true, []models.User{user})
}

func (app application) getUserByID(writer http.ResponseWriter, request *http.Request) {
	app.getSingleUser(writer, request, chi.URLParam(request, "userId"), "User ID", app.users.FindByID)
}

func (app application) getUserByUsername(writer http.ResponseWriter, request *http.Request) {
	app.getSingleUser(writer, request, chi.URLParam(request, "username"), "Username", app.users.FindByUsername)
}

func (app application) getSingleUser(
	writer http.ResponseWriter,
	request *http.Request,
	value string,
	name string,
	find func(context.Context, string) (models.User, error),
) {
	if value == "" {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"success": false, "error": name + " is required"})
		return
	}
	user, err := find(request.Context(), value)
	if errors.Is(err, repository.ErrUserNotFound) {
		writeUserList(writer, http.StatusOK, false, nil)
		return
	}
	if errors.Is(err, repository.ErrInvalidUserID) {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"success": false, "error": "Invalid User ID format"})
		return
	}
	if err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{"success": false, "error": "Unable to retrieve user"})
		return
	}
	writeUserList(writer, http.StatusOK, true, []models.User{user})
}

func (app application) getUsers(writer http.ResponseWriter, request *http.Request) {
	users, err := app.users.FindAll(request.Context())
	if err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{"success": false, "error": "Unable to retrieve users"})
		return
	}
	writeUserList(writer, http.StatusOK, true, users)
}

func (app application) createUser(writer http.ResponseWriter, request *http.Request) {
	var input models.UserRequest
	if err := json.NewDecoder(request.Body).Decode(&input); err != nil {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"success": false, "error": "Invalid request body"})
		return
	}
	if input.Email == "" || input.Username == "" || input.Password == "" {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"success": false, "error": "Email, username, and password are required"})
		return
	}
	user, err := app.users.Create(request.Context(), input)
	if err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{"success": false, "error": "Unable to create user"})
		return
	}
	writeUserList(writer, http.StatusCreated, true, []models.User{user})
}

func (app application) updateUser(writer http.ResponseWriter, request *http.Request) {
	userID := chi.URLParam(request, "userId")
	var input models.UserRequest
	if err := json.NewDecoder(request.Body).Decode(&input); err != nil {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"success": false, "error": "Invalid request body"})
		return
	}
	if input.Email == "" || input.Username == "" {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"success": false, "error": "Email and username are required"})
		return
	}
	user, err := app.users.Update(request.Context(), userID, input)
	if errors.Is(err, repository.ErrUserNotFound) {
		writeUserList(writer, http.StatusOK, false, nil)
		return
	}
	if err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{"success": false, "error": "Unable to update user"})
		return
	}
	writeUserList(writer, http.StatusOK, true, []models.User{user})
}

func (app application) deleteUser(writer http.ResponseWriter, request *http.Request) {
	err := app.users.Delete(request.Context(), chi.URLParam(request, "userId"))
	if errors.Is(err, repository.ErrUserNotFound) {
		writeUserList(writer, http.StatusOK, false, nil)
		return
	}
	if errors.Is(err, repository.ErrInvalidUserID) {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"success": false, "error": "Invalid User ID format"})
		return
	}
	if err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{"success": false, "error": "Unable to delete user"})
		return
	}
	writeJSON(writer, http.StatusOK, map[string]any{"success": true, "data": []models.UserResponse{}, "count": 1})
}

func writeUserList(writer http.ResponseWriter, status int, success bool, users []models.User) {
	data := make([]models.UserResponse, 0, len(users))
	for _, user := range users {
		data = append(data, user.ToResponse())
	}
	writeJSON(writer, status, map[string]any{"success": success, "data": data, "count": len(data)})
}

func writeJSON(writer http.ResponseWriter, status int, payload any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(status)
	_ = json.NewEncoder(writer).Encode(payload)
}
