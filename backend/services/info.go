package misc

import (
	"backend/db"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"net/http"
)

func Health(ctx context.Context, pool db.Pool) (string, *utils.ServiceError) {
	q := repository.New(pool)
	version, err := q.DbVersion(ctx)
	if err != nil {
		return "", &utils.ServiceError{Err: err, Status: http.StatusInternalServerError}
	}
	return version, nil
}
