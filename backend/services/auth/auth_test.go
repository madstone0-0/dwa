package auth

import (
	_ "backend/internal/utils"
	"backend/repository"
	"context"
	"errors"
	_ "net/http"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	_ "github.com/stretchr/testify/require"
)

type MockQueries struct {
	mock.Mock
}

type MockPool struct {
	mock.Mock
}

type MockTx struct {
	mock.Mock
}

type MockRow struct {
	mock.Mock
}

func (m *MockQueries) GetUserByEmail(ctx context.Context, email string) (repository.User, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(repository.User), args.Error(1)
}

func (m *MockQueries) GetUserById(ctx context.Context, uid pgtype.UUID) (repository.User, error) {
	args := m.Called(ctx, uid)
	return args.Get(0).(repository.User), args.Error(1)
}

func (m *MockQueries) GetBuyerByEmail(ctx context.Context, email string) (repository.GetBuyerByEmailRow, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(repository.GetBuyerByEmailRow), args.Error(1)
}

func (m *MockQueries) GetVendorByEmail(ctx context.Context, email string) (repository.GetVendorByEmailRow, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(repository.GetVendorByEmailRow), args.Error(1)
}

func (m *MockQueries) InsertUser(ctx context.Context, arg repository.InsertUserParams) (pgtype.UUID, error) {
	args := m.Called(ctx, arg)
	return args.Get(0).(pgtype.UUID), args.Error(1)
}

func (m *MockQueries) InsertBuyer(ctx context.Context, arg repository.InsertBuyerParams) error {
	args := m.Called(ctx, arg)
	return args.Error(0)
}

func (m *MockQueries) InsertVendor(ctx context.Context, arg repository.InsertVendorParams) error {
	args := m.Called(ctx, arg)
	return args.Error(0)
}

func (m *MockQueries) WithTx(tx pgx.Tx) *repository.Queries {
	args := m.Called(tx)
	return args.Get(0).(*repository.Queries)
}

func (m *MockPool) Begin(ctx context.Context) (pgx.Tx, error) {
	args := m.Called(ctx)
	return args.Get(0).(pgx.Tx), args.Error(1)
}

func (m *MockTx) Commit(ctx context.Context) error {
	args := m.Called(ctx)
	return args.Error(0)
}

func (m *MockTx) Rollback(ctx context.Context) error {
	args := m.Called(ctx)
	return args.Error(0)
}

func (m *MockPool) Close() {
	m.Called()
}

func (m *MockPool) Exec(ctx context.Context, cmd string, extra ...any) (pgconn.CommandTag, error) {
	args := m.Called(ctx, cmd, extra)
	return args.Get(0).(pgconn.CommandTag), args.Error(1)
}

func (m *MockPool) Query(ctx context.Context, cmd string, extra ...any) (pgx.Rows, error) {
	args := m.Called(ctx, cmd, extra)
	return args.Get(0).(pgx.Rows), args.Error(1)
}

func (m *MockRow) Scan(dest ...any) error {
	args := m.Called(dest...)
	return args.Error(0)
}

func (m *MockPool) QueryRow(ctx context.Context, cmd string, extra ...any) pgx.Row {
	args := m.Called(ctx, cmd, extra)
	return args.Get(0).(pgx.Row)
}

func setupScanWithUUID(mockRow *MockRow, uid pgtype.UUID) {
	mockRow.On("Scan", mock.Anything).Run(func(args mock.Arguments) {
		if dest, ok := args.Get(0).(*pgtype.UUID); ok {
			*dest = uid
		}
	}).Return(nil)
}

func setupScanReturn(mockRow *MockRow, ret any) {
	mockRow.On("Scan", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(ret).Once()
}

func setupScanExists(mockRow *MockRow) {
	setupScanReturn(mockRow, nil)
}

func setupScanNotExists(mockRow *MockRow, err error) {
	setupScanReturn(mockRow, err)
}

func setupPool(mockPool *MockPool, mockRow *MockRow, sqlCmd string, ctx context.Context, extra []any) {
	mockPool.On("QueryRow", ctx, sqlCmd, extra).
		Return(mockRow).Once()
}

func TestDoesUserExistByEmail(t *testing.T) {
	ctx := context.Background()
	mockPool := &MockPool{}
	const sqlCmd string = `-- name: GetUserByEmail :one
select uid, email, passhash, isadmin from "user" where email like $1 limit 1
`

	t.Run("User exists", func(t *testing.T) {
		mockRow := &MockRow{}

		setupScanExists(mockRow)
		setupPool(mockPool, mockRow, sqlCmd, ctx, []any{"exists@test.com"})

		exists, err := doesUserExistByEmail(ctx, mockPool, "exists@test.com")
		assert.NoError(t, err)
		assert.True(t, exists)
		mockRow.AssertExpectations(t)
	})

	t.Run("User not found", func(t *testing.T) {
		mockRow := &MockRow{}

		setupScanNotExists(mockRow, pgx.ErrNoRows)
		setupPool(mockPool, mockRow, sqlCmd, ctx, []any{"nonexistent@test.com"})

		exists, err := doesUserExistByEmail(ctx, mockPool, "nonexistent@test.com")
		assert.NoError(t, err)
		assert.False(t, exists)
	})

	t.Run("Database error", func(t *testing.T) {
		mockRow := &MockRow{}

		setupScanNotExists(mockRow, errors.New("e"))
		setupPool(mockPool, mockRow, sqlCmd, ctx, []any{"error@test.com"})

		exists, err := doesUserExistByEmail(ctx, mockPool, "error@test.com")
		assert.Error(t, err)
		assert.False(t, exists)
	})

	mockPool.AssertExpectations(t)
}

func TestIsUserBuyer(t *testing.T) {
	ctx := context.Background()
	mockPool := &MockPool{}
	const sqlCmd string = `-- name: GetBuyerByEmail :one
select
    "user".uid,
    email,
    name,
    passhash
from
    "user"
inner join buyer on
    "user".uid = buyer.uid
where
    email like $1
limit 1
`

	t.Run("Is buyer", func(t *testing.T) {
		mockRow := &MockRow{}
		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		setupScanWithUUID(mockRow, testUUID)

		setupScanExists(mockRow)
		setupPool(mockPool, mockRow, sqlCmd, ctx, []any{"buyer@test.com"})

		isBuyer, err := isUserBuyer(ctx, mockPool, "buyer@test.com")
		assert.NoError(t, err)
		assert.True(t, isBuyer)
	})

	t.Run("Not a buyer", func(t *testing.T) {
		mockRow := &MockRow{}

		setupScanNotExists(mockRow, pgx.ErrNoRows)
		setupPool(mockPool, mockRow, sqlCmd, ctx, []any{"vendor@test.com"})

		isBuyer, err := isUserBuyer(ctx, mockPool, "vendor@test.com")
		assert.NoError(t, err)
		assert.False(t, isBuyer)
	})

	t.Run("Database error", func(t *testing.T) {
		mockRow := &MockRow{}

		setupScanNotExists(mockRow, errors.New("err"))
		setupPool(mockPool, mockRow, sqlCmd, ctx, []any{"error@test.com"})

		isBuyer, err := isUserBuyer(ctx, mockPool, "error@test.com")
		assert.Error(t, err)
		assert.False(t, isBuyer)
	})

	mockPool.AssertExpectations(t)
}

// func TestSignUpBuyer(t *testing.T) {
// 	ctx := context.Background()
// 	mockPool := &MockPool{}
// 	mockQueries := &MockQueries{}
// 	mockTx := &MockTx{}
// 	mockRow := &MockRow{}
// 	const getUserSqlCmd string = `-- name: GetUserByEmail :one
// select uid, email, passhash, isadmin from "user" where email like $1 limit 1
// `
// 	const isAdminSqlCmd string = `-- name: GetUserById :one
// select uid, email, passhash, isadmin from "user" where uid = $1 limit 1
// `
//
// 	t.Run("Success", func(t *testing.T) {
// 		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
//
// 		setupPool(mockPool, mockRow, getUserSqlCmd, ctx, []any{"new@test.com"})
// 		setupScanReturn(mockRow, nil)
// 		mockRow.On("Scan", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(utils.ServiceReturn[any]{
// 			Status: 201,
// 		}).Once()
// 		mockPool.On("Begin", ctx).Return(mockTx, nil).Once()
// 		mockQueries.On("WithTx", mockTx).Return(mockQueries).Once()
// 		mockQueries.On("GetUserByEmail", ctx, "new@test.com").Return(repository.User{}, pgx.ErrNoRows).Once()
// 		mockQueries.On("InsertUser", ctx, mock.Anything).Return(testUUID, nil).Once()
// 		mockQueries.On("InsertBuyer", ctx, mock.Anything).Return(nil).Once()
// 		mockTx.On("Commit", ctx).Return(nil).Once()
// 		mockTx.On("Rollback", ctx).Return(nil).Maybe()
//
// 		Hasher = MockHasher{}
// 		defer func() { Hasher = originalHasher }()
//
// 		result := SignUp(ctx, mockPool, SignupUser{
// 			Email:    "new@test.com",
// 			Password: "password",
// 			Name:     "Test Buyer",
// 			IsVendor: false,
// 		})
//
// 		assert.Equal(t, http.StatusCreated, result.Status)
// 		mockQueries.AssertExpectations(t)
// 		mockTx.AssertExpectations(t)
// 	})
//
// 	t.Run("User exists", func(t *testing.T) {
// 		existingUser := repository.User{Uid: pgtype.UUID{Bytes: [16]byte{1}, Valid: true}, Email: "exists@test.com"}
// 		mockQueries.On("GetUserByEmail", ctx, "exists@test.com").Return(existingUser, nil).Once()
//
// 		result := SignUp(ctx, mockPool, SignupUser{
// 			Email:    "exists@test.com",
// 			Password: "password",
// 			Name:     "Existing User",
// 			IsVendor: false,
// 		})
//
// 		assert.Equal(t, http.StatusBadRequest, result.Status)
// 	})
//
// 	mockPool.AssertExpectations(t)
// }

type MockHasher struct{}

var originalHasher = Hasher

func (m MockHasher) Hash(password string) (string, error) {
	return "hashed", nil
}

func (m MockHasher) Compare(password, hash string) bool {
	return password == "correct"
}

// func TestLoginBuyer(t *testing.T) {
// 	ctx := context.Background()
// 	mockPool := &MockPool{}
// 	mockQueries := &MockQueries{}
//
// 	t.Run("Success", func(t *testing.T) {
// 		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
// 		userRow := repository.User{
// 			Uid:      testUUID,
// 			Email:    "buyer@test.com",
// 			Passhash: "hashed",
// 		}
// 		buyerRow := repository.GetBuyerByEmailRow{
// 			Uid:   testUUID,
// 			Email: "buyer@test.com",
// 			Name:  "Test Buyer",
// 		}
//
// 		mockQueries.On("GetUserByEmail", ctx, "buyer@test.com").Return(userRow, nil).Once()
// 		mockQueries.On("GetBuyerByEmail", ctx, "buyer@test.com").Return(buyerRow, nil).Once()
//
// 		Hasher = MockHasher{}
// 		defer func() { Hasher = originalHasher }()
//
// 		result := Login(ctx, mockPool, LoginUser{
// 			Email:    "buyer@test.com",
// 			Password: "correct",
// 		})
//
// 		assert.Equal(t, http.StatusOK, result.Status)
// 		data := result.Data.(InfoWToken)
// 		assert.Equal(t, "buyer@test.com", data.Email)
// 		assert.NotEmpty(t, data.Token)
// 	})
//
// 	mockQueries.AssertExpectations(t)
// }

// func TestDoesUserExistById(t *testing.T) {
// 	ctx := context.Background()
// 	mockPool := &MockPool{}
// 	mockQueries := &MockQueries{}
//
// 	t.Run("User exists", func(t *testing.T) {
// 		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
// 		mockQueries.On("GetUserById", ctx, testUUID).Return(repository.User{
// 			Uid: testUUID,
// 		}, nil).Once()
//
// 		exists, err := doesUserExistById(ctx, mockPool, testUUID)
// 		assert.NoError(t, err)
// 		assert.True(t, exists)
// 	})
//
// 	t.Run("User not found", func(t *testing.T) {
// 		testUUID := pgtype.UUID{Bytes: [16]byte{2}, Valid: true}
// 		mockQueries.On("GetUserById", ctx, testUUID).Return(repository.User{}, pgx.ErrNoRows).Once()
//
// 		exists, err := doesUserExistById(ctx, mockPool, testUUID)
// 		assert.NoError(t, err)
// 		assert.False(t, exists)
// 	})
//
// 	t.Run("Database error", func(t *testing.T) {
// 		testUUID := pgtype.UUID{Bytes: [16]byte{3}, Valid: true}
// 		mockQueries.On("GetUserById", ctx, testUUID).Return(repository.User{}, errors.New("db error")).Once()
//
// 		exists, err := doesUserExistById(ctx, mockPool, testUUID)
// 		assert.Error(t, err)
// 		assert.False(t, exists)
// 	})
//
// 	mockQueries.AssertExpectations(t)
// }
//
// func TestSignUpVendor(t *testing.T) {
// 	ctx := context.Background()
// 	mockPool := &MockPool{}
// 	mockQueries := &MockQueries{}
// 	mockTx := &MockTx{}
//
// 	t.Run("Success", func(t *testing.T) {
// 		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
//
// 		mockPool.On("Begin", ctx).Return(mockTx, nil).Once()
// 		mockQueries.On("WithTx", mockTx).Return(mockQueries).Once()
// 		mockQueries.On("GetUserByEmail", ctx, "vendor@test.com").Return(repository.User{}, pgx.ErrNoRows).Once()
// 		mockQueries.On("InsertUser", ctx, mock.Anything).Return(testUUID, nil).Once()
// 		mockQueries.On("InsertVendor", ctx, mock.Anything).Return(nil).Once()
// 		mockTx.On("Commit", ctx).Return(nil).Once()
// 		mockTx.On("Rollback", ctx).Return(nil).Maybe()
//
// 		Hasher = MockHasher{}
// 		defer func() { Hasher = originalHasher }()
//
// 		result := SignUp(ctx, mockPool, SignupUser{
// 			Email:    "vendor@test.com",
// 			Password: "password",
// 			Name:     "Test Vendor",
// 			IsVendor: true,
// 		})
//
// 		assert.Equal(t, http.StatusCreated, result.Status)
// 		assert.Equal(t, "Vendor created", result.Data.(utils.JMap)["msg"])
// 	})
//
// 	t.Run("Insert vendor error", func(t *testing.T) {
// 		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
//
// 		mockPool.On("Begin", ctx).Return(mockTx, nil).Once()
// 		mockQueries.On("WithTx", mockTx).Return(mockQueries).Once()
// 		mockQueries.On("GetUserByEmail", ctx, "error@test.com").Return(repository.User{}, pgx.ErrNoRows).Once()
// 		mockQueries.On("InsertUser", ctx, mock.Anything).Return(testUUID, nil).Once()
// 		mockQueries.On("InsertVendor", ctx, mock.Anything).Return(errors.New("insert error")).Once()
// 		mockTx.On("Rollback", ctx).Return(nil).Once()
//
// 		Hasher = MockHasher{}
// 		defer func() { Hasher = originalHasher }()
//
// 		result := SignUp(ctx, mockPool, SignupUser{
// 			Email:    "error@test.com",
// 			Password: "password",
// 			Name:     "Error Vendor",
// 			IsVendor: true,
// 		})
//
// 		assert.Equal(t, http.StatusInternalServerError, result.Status)
// 	})
//
// 	mockPool.AssertExpectations(t)
// 	mockQueries.AssertExpectations(t)
// }
//
// func TestLoginVendor(t *testing.T) {
// 	ctx := context.Background()
// 	mockPool := &MockPool{}
// 	mockQueries := &MockQueries{}
//
// 	t.Run("Success", func(t *testing.T) {
// 		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
// 		userRow := repository.User{
// 			Uid:      testUUID,
// 			Email:    "vendor@test.com",
// 			Passhash: "hashed",
// 		}
// 		vendorRow := repository.GetVendorByEmailRow{
// 			Uid:  testUUID,
// 			Name: "Test Vendor",
// 		}
//
// 		mockQueries.On("GetUserByEmail", ctx, "vendor@test.com").Return(userRow, nil).Once()
// 		mockQueries.On("GetBuyerByEmail", ctx, "vendor@test.com").Return(repository.GetBuyerByEmailRow{}, pgx.ErrNoRows).Once()
// 		mockQueries.On("GetVendorByEmail", ctx, "vendor@test.com").Return(vendorRow, nil).Once()
//
// 		Hasher = MockHasher{}
// 		defer func() { Hasher = originalHasher }()
//
// 		result := Login(ctx, mockPool, LoginUser{
// 			Email:    "vendor@test.com",
// 			Password: "correct",
// 		})
//
// 		assert.Equal(t, http.StatusOK, result.Status)
// 		data := result.Data.(InfoWToken)
// 		assert.Equal(t, "vendor@test.com", data.Email)
// 		assert.Equal(t, "Test Vendor", data.Name)
// 		assert.NotEmpty(t, data.Token)
// 	})
//
// 	t.Run("Vendor not found", func(t *testing.T) {
// 		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
// 		userRow := repository.User{
// 			Uid:      testUUID,
// 			Email:    "novendor@test.com",
// 			Passhash: "hashed",
// 		}
//
// 		mockQueries.On("GetUserByEmail", ctx, "novendor@test.com").Return(userRow, nil).Once()
// 		mockQueries.On("GetBuyerByEmail", ctx, "novendor@test.com").Return(repository.GetBuyerByEmailRow{}, pgx.ErrNoRows).Once()
// 		mockQueries.On("GetVendorByEmail", ctx, "novendor@test.com").Return(repository.GetVendorByEmailRow{}, pgx.ErrNoRows).Once()
//
// 		Hasher = MockHasher{}
// 		defer func() { Hasher = originalHasher }()
//
// 		result := Login(ctx, mockPool, LoginUser{
// 			Email:    "novendor@test.com",
// 			Password: "correct",
// 		})
//
// 		assert.Equal(t, http.StatusUnauthorized, result.Status)
// 	})
//
// 	mockQueries.AssertExpectations(t)
// }
//
// func TestLoginIncorrectPassword(t *testing.T) {
// 	ctx := context.Background()
// 	mockPool := &MockPool{}
// 	mockQueries := &MockQueries{}
//
// 	t.Run("Incorrect password", func(t *testing.T) {
// 		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
// 		userRow := repository.User{
// 			Uid:      testUUID,
// 			Email:    "user@test.com",
// 			Passhash: "hashed",
// 		}
// 		buyerRow := repository.GetBuyerByEmailRow{
// 			Uid:  testUUID,
// 			Name: "Test User",
// 		}
//
// 		mockQueries.On("GetUserByEmail", ctx, "user@test.com").Return(userRow, nil).Once()
// 		mockQueries.On("GetBuyerByEmail", ctx, "user@test.com").Return(buyerRow, nil).Once()
//
// 		Hasher = MockHasher{}
// 		defer func() { Hasher = originalHasher }()
//
// 		result := Login(ctx, mockPool, LoginUser{
// 			Email:    "user@test.com",
// 			Password: "wrong",
// 		})
//
// 		assert.Equal(t, http.StatusUnauthorized, result.Status)
// 		assert.Contains(t, result.Data.(utils.JMap)["err"], "Incorrect password")
// 	})
//
// 	mockQueries.AssertExpectations(t)
// }
//
// func TestLoginUserNotExist(t *testing.T) {
// 	ctx := context.Background()
// 	mockPool := &MockPool{}
// 	mockQueries := &MockQueries{}
//
// 	t.Run("Non-existent user", func(t *testing.T) {
// 		mockQueries.On("GetUserByEmail", ctx, "ghost@test.com").Return(repository.User{}, pgx.ErrNoRows).Once()
//
// 		result := Login(ctx, mockPool, LoginUser{
// 			Email:    "ghost@test.com",
// 			Password: "any",
// 		})
//
// 		assert.Equal(t, http.StatusBadRequest, result.Status)
// 		assert.Contains(t, result.Data.(utils.JMap)["err"], "user does not exist")
// 	})
//
// 	mockQueries.AssertExpectations(t)
// }
//
// func TestLoginDatabaseError(t *testing.T) {
// 	ctx := context.Background()
// 	mockPool := &MockPool{}
// 	mockQueries := &MockQueries{}
//
// 	t.Run("Database error", func(t *testing.T) {
// 		mockQueries.On("GetUserByEmail", ctx, "error@test.com").Return(repository.User{}, errors.New("db error")).Once()
//
// 		result := Login(ctx, mockPool, LoginUser{
// 			Email:    "error@test.com",
// 			Password: "any",
// 		})
//
// 		assert.Equal(t, http.StatusInternalServerError, result.Status)
// 		assert.Contains(t, result.Data.(utils.JMap)["err"], "db error")
// 	})
//
// 	mockQueries.AssertExpectations(t)
// }
