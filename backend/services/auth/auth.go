package auth

import (
	"backend/db"
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/internal/utils/hashing"
	"backend/internal/utils/validation"
	"backend/repository"
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	emailverifier "github.com/AfterShip/email-verifier"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type SignupUser struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Name     string `json:"name" validate:"required"`
	IsVendor bool   `json:"isVendor"`
}

func (su SignupUser) String() string {
	return fmt.Sprintf("{%s %s %v}", su.Email, su.Name, su.IsVendor)
}

type LoginUser struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

var (
	Hasher   hashing.Hasher = hashing.BcryptHash{}
	Enver    utils.Enver    = utils.DefaultEnv{}
	verifier                = emailverifier.NewVerifier().EnableSMTPCheck().DisableCatchAllCheck()
)

func doesUserExistByEmail(ctx context.Context, pool db.Pool, email string) (bool, error) {
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

func IsUserBuyer(ctx context.Context, pool db.Pool, email string) (bool, error) {
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

func doesUserExistById(ctx context.Context, pool db.Pool, uid pgtype.UUID) (bool, error) {
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

func SignUp(ctx context.Context, pool db.Pool, user SignupUser, verify bool) utils.ServiceReturn[any] {
	err := validation.ValidateStruct(user)
	if err != nil {
		return utils.MakeError(err, http.StatusBadRequest)
	}

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

	if verify {
		ret, err := verifier.Verify(user.Email)
		if err != nil {
			return utils.MakeError(err, http.StatusInternalServerError)
		}

		if !ret.Syntax.Valid {
			return utils.MakeError(errors.New("invalid email syntax"), http.StatusBadRequest)
		}

		smtpRes, err := verifier.CheckSMTP(ret.Syntax.Domain, ret.Syntax.Username)

		if err != nil {
			return utils.MakeError(err, http.StatusInternalServerError)
		}

		if !smtpRes.Deliverable {
			return utils.MakeError(errors.New("email not deliverable"), http.StatusBadRequest)
		}

	}

	q := repository.New(pool)
	qtx := q.WithTx(tx)

	passhash, err := Hasher.Hash(user.Password)
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

	if user.IsVendor {
		err = qtx.InsertVendor(ctx, repository.InsertVendorParams{
			Name: user.Name,
			Uid:  uid,
		})
	} else {
		err = qtx.InsertBuyer(ctx, repository.InsertBuyerParams{
			Name: user.Name,
			Uid:  uid,
		})
	}

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	tx.Commit(ctx)

	var msg string
	if user.IsVendor {
		msg = "Vendor created"
	} else {
		msg = "Buyer created"
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusCreated,
		Data: utils.JMap{
			"msg": msg,
		},
	}
}

type UserInfo struct {
	Uid      pgtype.UUID `json:"uid"`
	Email    string      `json:"email" validate:"required,email"`
	Name     string      `json:"name"`
	UserType string      `json:"user_type" validate:"required,oneof=buyer vendor"`
	Passhash string      `json:"-"`
}

type InfoWToken struct {
	UserInfo
	Token string `json:"token"`
}

func Login(ctx context.Context, pool db.Pool, user LoginUser) utils.ServiceReturn[any] {
	err := validation.ValidateStruct(user)
	if err != nil {
		return utils.MakeError(err, http.StatusBadRequest)
	}

	exists, err := doesUserExistByEmail(ctx, pool, user.Email)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if !exists {
		return utils.MakeError(errors.New("user does not exist"), http.StatusBadRequest)
	}

	q := repository.New(pool)

	isBuyer, err := IsUserBuyer(ctx, pool, user.Email)
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

		if !Hasher.Compare(user.Password, info.Passhash) {
			return utils.ServiceReturn[any]{
				Status: http.StatusUnauthorized,
				Data: utils.JMap{
					"err": "Incorrect password",
				},
			}
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"email":    user.Email,
			"userType": "buyer",
			"nbf":      time.Now().Unix(),
		})

		tokenString, err := token.SignedString([]byte(Enver.Env("SECRET")))
		if err != nil {
			return utils.MakeError(err, http.StatusInternalServerError)
		}

		infoWToken := InfoWToken{
			UserInfo: UserInfo{
				Uid:      info.Uid,
				Email:    info.Email,
				Name:     info.Name,
				Passhash: info.Passhash,
				UserType: "buyer",
			},
			Token: tokenString,
		}

		return utils.ServiceReturn[any]{
			Status: http.StatusOK,
			Data:   infoWToken,
		}

	} else {
		info, err := q.GetVendorByEmail(ctx, user.Email)
		if err != nil {
			return utils.MakeError(err, http.StatusInternalServerError)
		}

		if !Hasher.Compare(user.Password, info.Passhash) {
			return utils.ServiceReturn[any]{
				Status: http.StatusUnauthorized,
				Data: utils.JMap{
					"err": "Incorrect password",
				},
			}
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"email":    user.Email,
			"userType": "vendor",
			"nbf":      time.Now().Unix(),
		})

		tokenString, err := token.SignedString([]byte(Enver.Env("SECRET")))
		if err != nil {
			return utils.MakeError(err, http.StatusInternalServerError)
		}

		infoWToken := InfoWToken{
			UserInfo: UserInfo(UserInfo{
				Uid:      info.Uid,
				Email:    info.Email,
				Name:     info.Name,
				Passhash: info.Passhash,
				UserType: "vendor",
			}),
			Token: tokenString,
		}

		return utils.ServiceReturn[any]{
			Status: http.StatusOK,
			Data:   infoWToken,
		}

	}

}

type UserTypes struct {
	Buyer  *repository.Buyer  `json:"buyer,omitempty" mapstructure:",squash,omitempty"`
	Vendor *repository.Vendor `json:"vendor,omitempty" mapstructure:",squash,omitempty"`
}

type UpdateUser struct {
	User struct {
		UserType string `json:"user_type" validate:"required,oneof=buyer vendor"`
		Email    string `json:"email" validate:"required,email"`
	} `json:"user"`
	UserTypes UserTypes `json:"user_types" validate:"required"`
}

func (uu *UpdateUser) Validate() error {
	if uu.User.UserType == "buyer" && uu.UserTypes.Buyer == nil {
		return errors.New("buyer data required when type is buyer")
	}

	if uu.User.UserType == "vendor" && uu.UserTypes.Vendor == nil {
		return errors.New("vendor data required when type is vendor")
	}

	if uu.User.UserType == "buyer" && uu.UserTypes.Vendor != nil {
		return errors.New("vendor data should not be provided for buyer type")
	}

	if uu.User.UserType == "vendor" && uu.UserTypes.Buyer != nil {
		return errors.New("buyer data should not be provided for vendor type")
	}

	return nil
}

func Update(ctx context.Context, pool db.Pool, user UpdateUser) utils.ServiceReturn[any] {
	err := user.Validate()
	if err != nil {
		return utils.MakeError(err, http.StatusBadRequest)
	}

	err = validation.ValidateStruct(user)
	if err != nil {
		return utils.MakeError(err, http.StatusBadRequest)
	}

	var (
		uType  = utils.ParseUserType(user.User.UserType)
		uid    pgtype.UUID
		entity string
		q      = repository.New(pool)
	)

	switch uType {
	case utils.VENDOR:
		{
			uid = user.UserTypes.Vendor.Uid
			entity = "Vendor"
		}
	case utils.BUYER:
		{
			uid = user.UserTypes.Buyer.Uid
			entity = "Buyer"
		}
	}

	exists, err := doesUserExistById(ctx, pool, uid)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}
	if !exists {
		return utils.MakeError(errors.New(strings.ToLower(entity)+" does not exist"), http.StatusNotFound)
	}

	u, err := q.GetUserById(ctx, uid)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}
	oldEmail := u.Email

	switch uType {
	case utils.VENDOR:
		{
			vendor := user.UserTypes.Vendor

			exists, err = IsUserBuyer(ctx, pool, oldEmail)
			if err != nil {
				return utils.MakeError(err, http.StatusInternalServerError)
			}
			if exists {
				return utils.MakeError(errors.New("user is not a vendor"), http.StatusBadRequest)
			}

			err = q.UpdateVendor(ctx, repository.UpdateVendorParams{
				Name:  vendor.Name,
				Email: user.User.Email,
				Logo:  vendor.Logo,
				Uid:   uid,
			})

			if err != nil {
				return utils.MakeError(err, http.StatusInternalServerError)
			}

		}

	case utils.BUYER:
		{
			buyer := user.UserTypes.Buyer

			exists, err = IsUserBuyer(ctx, pool, oldEmail)
			if err != nil {
				return utils.MakeError(err, http.StatusInternalServerError)
			}
			if !exists {
				return utils.MakeError(errors.New("user is not a buyer"), http.StatusBadRequest)
			}

			err = q.UpdateBuyer(ctx, repository.UpdateBuyerParams{
				Name:  buyer.Name,
				Email: user.User.Email,
				Uid:   uid,
			})

			if err != nil {
				return utils.MakeError(err, http.StatusInternalServerError)
			}
		}

	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"msg": entity + " updated",
		},
	}
}

func Delete(ctx context.Context, pool db.Pool, uid pgtype.UUID) utils.ServiceReturn[any] {
	err := validation.ValidateVar(uid, "required,uuid4")
	if err != nil {
		return utils.MakeError(err, http.StatusBadRequest)
	}

	exists, err := doesUserExistById(ctx, pool, uid)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if !exists {
		return utils.MakeError(errors.New("user does not exist"), http.StatusNotFound)
	}

	q := repository.New(pool)
	err = q.DeleteUser(ctx, uid)

	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"msg": "User deleted",
		},
	}

}
