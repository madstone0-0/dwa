package misc

import (
	"backend/internal/utils"
	"backend/repository"
	"context"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Health(ctx context.Context, pool *pgxpool.Pool) (string, *utils.ServiceError) {
	q := repository.New(pool)
	version, err := q.DbVersion(ctx)
	if err != nil {
		return "", &utils.ServiceError{Err: err, Status: http.StatusInternalServerError}
	}
	return version, nil
}
