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

func doesItemExistByName(ctx context.Context, pool db.Pool, name string) (bool, error) {
	q := repository.New(pool)
	_, err := q.GetItemByName(ctx, name)
	if err != nil {
		if err == pgx.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func doesItemExistById(ctx context.Context, pool db.Pool, iid pgtype.UUID) (bool, error) {
	q := repository.New(pool)
	_, err := q.GetItemById(ctx, iid)
	if err != nil {
		if err == pgx.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func All(ctx context.Context, pool db.Pool) utils.ServiceReturn[any] {
	q := repository.New(pool)

	items, err := q.GetAllItems(ctx)
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

func ByIid(ctx context.Context, pool db.Pool, iid pgtype.UUID) utils.ServiceReturn[any] {
	exists, err := doesItemExistById(ctx, pool, iid)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if !exists {
		return utils.MakeError(errors.New("item does not exist"), http.StatusNotFound)
	}

	q := repository.New(pool)
	item, err := q.GetItemByIdWithVendorInfo(ctx, iid)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data:   item,
	}

}

func ByVid(ctx context.Context, pool db.Pool, vid pgtype.UUID) utils.ServiceReturn[any] {
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

	exists, err = doesItemExistByName(ctx, pool, item.Name)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if exists {
		return utils.MakeError(errors.New("item with the same name already exists"), http.StatusConflict)
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

func Update(ctx context.Context, pool db.Pool, item repository.UpdateItemParams) utils.ServiceReturn[any] {
	exists, err := doesVendorExistById(ctx, pool, item.Vid)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if !exists {
		return utils.MakeError(errors.New("vendor does not exist"), http.StatusNotFound)
	}

	exists, err = doesItemExistById(ctx, pool, item.Iid)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if !exists {
		return utils.MakeError(errors.New("item does not exist"), http.StatusConflict)
	}

	q := repository.New(pool)
	err = q.UpdateItem(ctx, item)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"msg": "Item updated",
		},
	}
}

// TODO: Probably include vendorId check
func Delete(ctx context.Context, pool db.Pool, iid pgtype.UUID) utils.ServiceReturn[any] {
	exists, err := doesItemExistById(ctx, pool, iid)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if !exists {
		return utils.MakeError(errors.New("item does not exist"), http.StatusNotFound)
	}

	q := repository.New(pool)
	err = q.DeleteItem(ctx, iid)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"msg": "Item deleted",
		},
	}
}
