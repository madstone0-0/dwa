package misc

import (
	"backend/db"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"net/http"
)

// Health checks the database connection by fetching its version
func Health(ctx context.Context, pool db.Pool) (string, *utils.ServiceError) {
	// Create a new repository instance to interact with the database
	q := repository.New(pool)

	// Query the database to get the current database version
	version, err := q.DbVersion(ctx)

	// If there is an error fetching the database version, return an internal server error
	if err != nil {
		return "", &utils.ServiceError{Err: err, Status: http.StatusInternalServerError}
	}

	// Return the database version if successful, along with a nil error
	return version, nil
}
