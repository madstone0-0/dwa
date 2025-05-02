package auth

import (
	// Project-specific packages
	"backend/db"
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/internal/utils/hashing"
	"backend/internal/utils/validation"
	"backend/repository"

	// Standard libraries
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	// External libraries
	emailverifier "github.com/AfterShip/email-verifier"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// SignupUser defines the required fields for signing up
type SignupUser struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Name     string `json:"name" validate:"required"`
	IsVendor bool   `json:"isVendor"`
}

// String provides a custom string representation of SignupUser
func (su SignupUser) String() string {
	return fmt.Sprintf("{%s %s %v}", su.Email, su.Name, su.IsVendor)
}

// LoginUser defines the fields needed for logging in
type LoginUser struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// Global variables
var (
	Hasher   hashing.Hasher         = hashing.BcryptHash{}                         // Password hasher
	Enver    utils.Enver            = utils.DefaultEnv{}                           // Environment variable getter
	verifier                        = emailverifier.NewVerifier().EnableSMTPCheck().DisableCatchAllCheck() // Email verifier
	TTL                             = time.Hour * 5                                // Token time-to-live
)

// Checks if a user exists based on email
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

// Determines if a user is a buyer
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

// Checks if a user exists based on UUID
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

// Handles user sign-up
func SignUp(ctx context.Context, pool db.Pool, user SignupUser, verify bool) utils.ServiceReturn[any] {
	// Validate input
	err := validation.ValidateStruct(user)
	if err != nil {
		return utils.MakeError(err, http.StatusBadRequest)
	}

	// Check if user already exists
	exists, err := doesUserExistByEmail(ctx, pool, user.Email)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}
	if exists {
		return utils.MakeError(errors.New("user already exists"), http.StatusBadRequest)
	}

	// Begin DB transaction
	tx, err := pool.Begin(ctx)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}
	defer tx.Rollback(ctx)

	// Optionally verify email
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

	// Hash password
	passhash, err := Hasher.Hash(user.Password)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	// Insert user into DB
	uid, err := qtx.InsertUser(ctx, repository.InsertUserParams{
		Email:    user.Email,
		Passhash: passhash,
	})
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	// Insert role-specific record (vendor or buyer)
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

	// Commit transaction
	tx.Commit(ctx)

	// Return success response
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

// UserInfo holds basic user details including hashed password
type UserInfo struct {
	Uid      pgtype.UUID `json:"uid"`
	Email    string      `json:"email" validate:"required,email"`
	Name     string      `json:"name"`
	UserType string      `json:"user_type" validate:"required,oneof=buyer vendor"`
	Passhash string      `json:"-"`
}

// InfoWToken embeds UserInfo and adds a JWT token
type InfoWToken struct {
	UserInfo
	Token string `json:"token"`
}

// Handles user login
func Login(ctx context.Context, pool db.Pool, user LoginUser) utils.ServiceReturn[any] {
	// Validate credentials
	err := validation.ValidateStruct(user)
	if err != nil {
		return utils.MakeError(err, http.StatusBadRequest)
	}

	// Check user existence
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

	// Determine user type
	userType := "vendor"
	if isBuyer {
		userType = "buyer"
	}
	logging.Infof("User is %s", userType)

	var uid pgtype.UUID
	var name, passhash string

	// Fetch user info by role
	if isBuyer {
		info, err := q.GetBuyerByEmail(ctx, user.Email)
		if err != nil {
			return utils.MakeError(err, http.StatusInternalServerError)
		}
		uid, name, passhash = info.Uid, info.Name, info.Passhash
	} else {
		info, err := q.GetVendorByEmail(ctx, user.Email)
		if err != nil {
			return utils.MakeError(err, http.StatusInternalServerError)
		}
		uid, name, passhash = info.Uid, info.Name, info.Passhash
	}

	// Validate password
	if !Hasher.Compare(user.Password, passhash) {
		return utils.ServiceReturn[any]{
			Status: http.StatusUnauthorized,
			Data: utils.JMap{
				"err": "Incorrect password",
			},
		}
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"uid":      uid,
		"email":    user.Email,
		"userType": userType,
		"exp":      time.Now().Add(TTL).Unix(),
	})

	tokenString, err := token.SignedString([]byte(Enver.Env("SECRET")))
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	// Return user info with token
	infoWToken := InfoWToken{
		UserInfo: UserInfo{
			Uid:      uid,
			Email:    user.Email,
			Name:     name,
			Passhash: passhash,
			UserType: userType,
		},
		Token: tokenString,
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data:   infoWToken,
	}
}

// UserTypes contains buyer or vendor embedded data
type UserTypes struct {
	Buyer  *repository.Buyer  `json:"buyer,omitempty" mapstructure:",squash,omitempty"`
	Vendor *repository.Vendor `json:"vendor,omitempty" mapstructure:",squash,omitempty"`
}

// UpdateUser contains fields needed to update user information
type UpdateUser struct {
	User struct {
		UserType string `json:"user_type" validate:"required,oneof=buyer vendor"`
		Email    string `json:"email" validate:"required,email"`
	} `json:"user"`
	UserTypes UserTypes `json:"user_types" validate:"required"`
}

// Validate checks the logical consistency of the update payload
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

// Update handles user profile updates
func Update(ctx context.Context, pool db.Pool, user UpdateUser) utils.ServiceReturn[any] {
	// Validate user type and structure
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

	// Determine entity type and extract UID
	switch uType {
	case utils.VENDOR:
		uid = user.UserTypes.Vendor.Uid
		entity = "Vendor"
	case utils.BUYER:
		uid = user.UserTypes.Buyer.Uid
		entity = "Buyer"
	}

	// Check if user exists
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
