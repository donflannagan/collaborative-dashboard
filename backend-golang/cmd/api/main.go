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
	FindByEmail(context.Context, string) (models.User, error)
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
		writeJSON(writer, http.StatusOK, map[string]any{
			"success": true,
			"data":    []any{},
			"count":   0,
		})
		return
	}
	if err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{
			"success": false,
			"error":   "Unable to retrieve user",
		})
		return
	}

	writeJSON(writer, http.StatusOK, map[string]any{
		"success": true,
		"data":    []models.UserResponse{user.ToResponse()},
		"count":   1,
	})
}

func writeJSON(writer http.ResponseWriter, status int, payload any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(status)
	_ = json.NewEncoder(writer).Encode(payload)
}
