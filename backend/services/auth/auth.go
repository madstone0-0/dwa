package auth

import (
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/internal/utils/hashing"
	"backend/repository"
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SignupUser struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
	Name     string `json:"name" binding:"required"`
}

type LoginUser struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func doesUserExistByEmail(ctx context.Context, pool *pgxpool.Pool, email string) (bool, error) {
	q := repository.New(pool)
	_, err := q.GetUserByEmail(ctx, email)
	if err != nil {
		if err == pgx.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func isUserBuyer(ctx context.Context, pool *pgxpool.Pool, email string) (bool, error) {
	q := repository.New(pool)
	_, err := q.GetBuyerByEmail(ctx, email)
	if err != nil {
		if err == pgx.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func doesUserExistById(ctx context.Context, pool *pgxpool.Pool, uid pgtype.UUID) (bool, error) {
	q := repository.New(pool)
	_, err := q.GetUserById(ctx, uid)
	if err != nil {
		if err == pgx.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func BuyerSignUp(ctx context.Context, pool *pgxpool.Pool, user SignupUser) utils.ServiceReturn[any] {
	exists, err := doesUserExistByEmail(ctx, pool, user.Email)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if exists {
		return utils.MakeError(errors.New("user already exists"), http.StatusBadRequest)
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}
	defer tx.Rollback(ctx)

	q := repository.New(pool)
	qtx := q.WithTx(tx)

	passhash, err := hashing.Hash(user.Password)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	uid, err := qtx.InsertUser(ctx, repository.InsertUserParams{
		Email:    user.Email,
		Passhash: passhash,
	})

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	err = qtx.InsertBuyer(ctx, repository.InsertBuyerParams{
		Name: user.Name,
		Uid:  uid,
	})

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	tx.Commit(ctx)
	return utils.ServiceReturn[any]{
		Status: http.StatusCreated,
		Data: utils.JMap{
			"msg": "Buyer created",
		},
	}
}

func Login(ctx context.Context, pool *pgxpool.Pool, user LoginUser) utils.ServiceReturn[any] {
	exists, err := doesUserExistByEmail(ctx, pool, user.Email)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if !exists {
		return utils.MakeError(errors.New("user does not exist"), http.StatusBadRequest)
	}

	q := repository.New(pool)

	isBuyer, err := isUserBuyer(ctx, pool, user.Email)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if isBuyer {
		logging.Infof("User is buyer")
	} else {
		logging.Infof("User is vendor")
	}

	if isBuyer {
		info, err := q.GetBuyerByEmail(ctx, user.Email)
		if err != nil {
			return utils.MakeError(err, http.StatusInternalServerError)
		}

		if !hashing.Compare(user.Password, info.Passhash) {
			return utils.ServiceReturn[any]{
				Status: http.StatusUnauthorized,
				Data: utils.JMap{
					"err": "Incorrect password",
				},
			}
		}

		return utils.ServiceReturn[any]{
			Status: http.StatusOK,
			Data:   info,
		}

	} else {
		info, err := q.GetVendorByEmail(ctx, user.Email)
		if err != nil {
			return utils.MakeError(err, http.StatusInternalServerError)
		}

		if !hashing.Compare(user.Password, info.Passhash) {
			return utils.ServiceReturn[any]{
				Status: http.StatusUnauthorized,
				Data: utils.JMap{
					"err": "Incorrect password",
				},
			}
		}

		return utils.ServiceReturn[any]{
			Status: http.StatusOK,
			Data:   info,
		}

	}

}
