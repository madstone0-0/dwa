package vendor

import (
	"backend/db"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func doesVendorExistById(ctx context.Context, pool db.Pool, vid pgtype.UUID) (bool, error) {
	q := repository.New(pool)
	_, err := q.GetVendorById(ctx, vid)
	if err != nil {
		if err == pgx.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func All(ctx context.Context, pool db.Pool, vid pgtype.UUID) utils.ServiceReturn[any] {
	exists, err := doesVendorExistById(ctx, pool, vid)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if !exists {
		return utils.MakeError(errors.New("vendor does not exist"), http.StatusNotFound)
	}

	q := repository.New(pool)

	items, err := q.GetItemsByVendorId(ctx, vid)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"items": items,
		},
	}
}

func Add(ctx context.Context, pool db.Pool, item repository.InsertItemParams) utils.ServiceReturn[any] {
	exists, err := doesVendorExistById(ctx, pool, item.Vid)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if !exists {
		return utils.MakeError(errors.New("vendor does not exist"), http.StatusNotFound)
	}

	q := repository.New(pool)

	iid, err := q.InsertItem(ctx, item)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusCreated,
		Data: utils.JMap{
			"iid": iid,
		},
	}

}
