package auth

import (
	it "backend/internal/testing"
	"backend/repository"
	"context"
	"errors"
	"net/http"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockHasher struct{}

var originalHasher = Hasher

func (m MockHasher) Hash(password string) (string, error) {
	return "hashed", nil
}

func (m MockHasher) Compare(password, hash string) bool {
	return password == "correct"
}

type MockEnver struct{}

var originalEnver = Enver

func (m MockEnver) Env(key string) string {
	return "SHADOW WIZARD MONEY GANG"
}

func TestDoesUserExistByEmail(t *testing.T) {
	ctx := context.Background()
	// Setup mock pool object which mocks a db connection pool
	mockPool := &it.MockPool{}
	const sqlCmd string = repository.GetUserByEmail

	t.Run("User exists", func(t *testing.T) {
		// Setup mock row object which mocks a db row
		mockRow := &it.MockRow{}

		// Setup the scan method to return a nil error indicating rows exist therefore the
		// user exists
		it.SetupScanExists(mockRow)
		// Setup the mock pool to return the mock row when the query is executed
		// this mock row calls the scan method
		it.SetupPoolQueryRow(mockPool, mockRow, sqlCmd, ctx, []any{"exists@test.com"})

		// Call the function to test
		exists, err := doesUserExistByEmail(ctx, mockPool, "exists@test.com")

		// Assert the function returns no error
		assert.NoError(t, err)
		// Assert the user exists
		assert.True(t, exists)

		// Assert the mock row was called
		mockRow.AssertExpectations(t)
	})

	t.Run("User not found", func(t *testing.T) {
		mockRow := &it.MockRow{}

		// Setup the scan method to return a non-nil error, pgx.ErrNoRows
		// indicating the rows do not exist therefore the user does not exist
		it.SetupScanNotExists(mockRow, pgx.ErrNoRows)
		it.SetupPoolQueryRow(mockPool, mockRow, sqlCmd, ctx, []any{"nonexistent@test.com"})

		exists, err := doesUserExistByEmail(ctx, mockPool, "nonexistent@test.com")
		// Assert the function returns no error
		assert.NoError(t, err)
		// Assert the user does not exist
		assert.False(t, exists)

		mockRow.AssertExpectations(t)

	})

	t.Run("Database error", func(t *testing.T) {
		mockRow := &it.MockRow{}

		// Setup the scan method to return a non-nil error, errors.New("e")
		// meaning an error occurred while executing the query
		it.SetupScanNotExists(mockRow, errors.New("e"))
		it.SetupPoolQueryRow(mockPool, mockRow, sqlCmd, ctx, []any{"error@test.com"})

		_, err := doesUserExistByEmail(ctx, mockPool, "error@test.com")

		// Assert the function returns an error
		assert.Error(t, err)
	})

	// Assert the mock pool was called
	mockPool.AssertExpectations(t)
}

func TestDoesUserExistById(t *testing.T) {
	ctx := context.Background()
	mockPool := &it.MockPool{}
	testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}

	t.Run("User exists", func(t *testing.T) {
		mockRow := &it.MockRow{}

		it.SetupScanExists(mockRow)
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetUserById, ctx, []any{testUUID})

		exists, err := doesUserExistById(ctx, mockPool, testUUID)

		assert.NoError(t, err)
		assert.True(t, exists)

		mockRow.AssertExpectations(t)
	})

	t.Run("User not found", func(t *testing.T) {
		testUUID = pgtype.UUID{Bytes: [16]byte{2}, Valid: true}
		mockRow := &it.MockRow{}

		it.SetupScanNotExists(mockRow, pgx.ErrNoRows)
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetUserById, ctx, []any{testUUID})

		exists, err := doesUserExistById(ctx, mockPool, testUUID)
		assert.NoError(t, err)
		assert.False(t, exists)

		mockRow.AssertExpectations(t)
	})

	t.Run("Database error", func(t *testing.T) {
		testUUID = pgtype.UUID{Bytes: [16]byte{3}, Valid: true}
		mockRow := &it.MockRow{}

		it.SetupScanNotExists(mockRow, errors.New("e"))
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetUserById, ctx, []any{testUUID})

		_, err := doesUserExistById(ctx, mockPool, testUUID)

		// Assert the function returns an error
		assert.Error(t, err)
	})

	mockPool.AssertExpectations(t)

}

func TestIsUserBuyer(t *testing.T) {
	ctx := context.Background()
	mockPool := &it.MockPool{}
	const sqlCmd string = repository.GetBuyerByEmail

	t.Run("Is buyer", func(t *testing.T) {
		mockRow := &it.MockRow{}
		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		it.SetupScanWithUUID(mockRow, testUUID)

		it.SetupScanExists(mockRow)
		it.SetupPoolQueryRow(mockPool, mockRow, sqlCmd, ctx, []any{"buyer@test.com"})

		isBuyer, err := IsUserBuyer(ctx, mockPool, "buyer@test.com")
		assert.NoError(t, err)
		assert.True(t, isBuyer)
	})

	t.Run("Not a buyer", func(t *testing.T) {
		mockRow := &it.MockRow{}

		it.SetupScanNotExists(mockRow, pgx.ErrNoRows)
		it.SetupPoolQueryRow(mockPool, mockRow, sqlCmd, ctx, []any{"vendor@test.com"})

		isBuyer, err := IsUserBuyer(ctx, mockPool, "vendor@test.com")
		assert.NoError(t, err)
		assert.False(t, isBuyer)
	})

	t.Run("Database error", func(t *testing.T) {
		mockRow := &it.MockRow{}

		it.SetupScanNotExists(mockRow, errors.New("err"))
		it.SetupPoolQueryRow(mockPool, mockRow, sqlCmd, ctx, []any{"error@test.com"})

		isBuyer, err := IsUserBuyer(ctx, mockPool, "error@test.com")
		assert.Error(t, err)
		assert.False(t, isBuyer)
	})

	mockPool.AssertExpectations(t)
}

func TestSignUp(t *testing.T) {
	ctx := context.Background()
	mockPool := &it.MockPool{}
	mockQueries := &it.MockQueries{}
	mockTx := &it.MockTx{}
	mockRow := &it.MockRow{}
	mockTransRow := &it.MockRow{}

	t.Run("Success", func(t *testing.T) {
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetUserByEmail, ctx, []any{"new@test.com"})
		it.SetupScanNotExists(mockRow, pgx.ErrNoRows)
		it.SetupScanExists(mockTransRow)
		it.SetupTxQueryRow(mockTx, mockTransRow, repository.InsertUser, ctx, []any{"new@test.com", "hashed"})
		it.SetupTxOnRet(mockTx, "Exec", repository.InsertBuyer, ctx, []any{pgtype.UUID{}, "Test Buyer"}, pgconn.CommandTag{}, nil)
		mockPool.On("Begin", ctx).Return(mockTx, nil)
		mockTx.On("Commit", ctx).Return(nil)
		mockTx.On("Rollback", ctx).Return(nil).Maybe()

		Hasher = MockHasher{}
		defer func() {
			Hasher = originalHasher
			mockRow = &it.MockRow{}
		}()

		result := SignUp(ctx, mockPool, SignupUser{
			Email:    "new@test.com",
			Password: "password",
			Name:     "Test Buyer",
			IsVendor: false,
		}, false)

		if result.ServiceErr != nil {
			t.Logf("Result: %+v", result)
			t.Logf("%+v", result.ServiceErr.Err)
		}
		assert.Equal(t, http.StatusCreated, result.Status)
		mockQueries.AssertExpectations(t)
		mockTx.AssertExpectations(t)
	})

	t.Run("User exists", func(t *testing.T) {
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetUserByEmail, ctx, []any{"exists@test.com"})
		it.SetupScanExists(mockRow)
		existingUser := repository.User{Uid: pgtype.UUID{Bytes: [16]byte{1}, Valid: true}, Email: "exists@test.com"}
		mockQueries.On("GetUserByEmail", ctx, "exists@test.com").Return(existingUser, nil).Once()

		result := SignUp(ctx, mockPool, SignupUser{
			Email:    "exists@test.com",
			Password: "password",
			Name:     "Existing User",
			IsVendor: false,
		}, false)

		if result.ServiceErr != nil {
			t.Logf("Result: %+v", result)
			t.Logf("%+v", result.ServiceErr.Err)
		}
		assert.NotNil(t, result.ServiceErr)
		assert.Equal(t, http.StatusBadRequest, result.ServiceErr.Status)
	})

	mockPool.AssertExpectations(t)
}

func TestLogin(t *testing.T) {
	ctx := context.Background()
	mockPool := &it.MockPool{}
	mockRow := &it.MockRow{}

	t.Run("Buyer Success", func(t *testing.T) {
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetUserByEmail, ctx, []any{"buyer@test.com"})
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetBuyerByEmail, ctx, []any{"buyer@test.com"})
		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		userRow := repository.User{
			Uid:      testUUID,
			Email:    "buyer@test.com",
			Passhash: "hashed",
		}
		buyerRow := repository.GetBuyerByEmailRow{
			Uid:   testUUID,
			Email: "buyer@test.com",
			Name:  "Test Buyer",
		}

		it.SetupScanExists(mockRow).Run(func(args mock.Arguments) {
			if dest, ok := args.Get(0).(*pgtype.UUID); ok {
				*dest = userRow.Uid
			}
			if dest, ok := args.Get(1).(*string); ok {
				*dest = userRow.Email
			}
			if dest, ok := args.Get(2).(*string); ok {
				*dest = buyerRow.Name
			}
			if dest, ok := args.Get(3).(*string); ok {
				*dest = userRow.Passhash
			}
		})

		Enver = MockEnver{}
		Hasher = MockHasher{}
		defer func() {
			Hasher = originalHasher
			Enver = originalEnver
		}()

		result := Login(ctx, mockPool, LoginUser{
			Email:    "buyer@test.com",
			Password: "correct",
		})

		if result.ServiceErr != nil {
			t.Logf("Result: %+v", result)
			t.Logf("%+v", result.ServiceErr.Err)
		}

		assert.Equal(t, http.StatusOK, result.Status)
		data := result.Data.(InfoWToken)
		assert.Equal(t, "buyer@test.com", data.Email)
		assert.NotEmpty(t, data.Token)
	})

	t.Run("Vendor Success", func(t *testing.T) {
		mockRow = &it.MockRow{}
		mockBuyerRow := &it.MockRow{}
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetUserByEmail, ctx, []any{"vendor@test.com"})
		it.SetupPoolQueryRow(mockPool, mockBuyerRow, repository.GetBuyerByEmail, ctx, []any{"vendor@test.com"})
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetVendorByEmail, ctx, []any{"vendor@test.com"})
		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		userRow := repository.User{
			Uid:      testUUID,
			Email:    "vendor@test.com",
			Passhash: "hashed",
		}
		buyerRow := repository.GetVendorByEmailRow{
			Uid:   testUUID,
			Email: "vendor@test.com",
			Name:  "Test Vendor",
		}

		it.SetupScanNotExists(mockBuyerRow, pgx.ErrNoRows)
		it.SetupScanReturnArgs(mockRow, nil, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			if dest, ok := args.Get(0).(*pgtype.UUID); ok {
				*dest = userRow.Uid
			}
			if dest, ok := args.Get(1).(*string); ok {
				*dest = userRow.Email
			}
			if dest, ok := args.Get(2).(*string); ok {
				*dest = buyerRow.Name
			}
			if dest, ok := args.Get(3).(*string); ok {
				*dest = userRow.Passhash
			}
		})

		Enver = MockEnver{}
		Hasher = MockHasher{}
		defer func() {
			Hasher = originalHasher
			Enver = originalEnver
		}()

		result := Login(ctx, mockPool, LoginUser{
			Email:    "vendor@test.com",
			Password: "correct",
		})

		if result.ServiceErr != nil {
			t.Logf("Result: %+v", result)
			t.Logf("%+v", result.ServiceErr.Err)
		}

		assert.Equal(t, http.StatusOK, result.Status)
		data := result.Data.(InfoWToken)
		assert.Equal(t, "vendor@test.com", data.Email)
		assert.NotEmpty(t, data.Token)
	})

	t.Run("Incorrect Password", func(t *testing.T) {
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetUserByEmail, ctx, []any{"buyer@test.com"})
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetBuyerByEmail, ctx, []any{"buyer@test.com"})

		Enver = MockEnver{}
		Hasher = MockHasher{}
		defer func() {
			Hasher = originalHasher
			Enver = originalEnver
		}()

		result := Login(ctx, mockPool, LoginUser{
			Email:    "buyer@test.com",
			Password: "wrong",
		})

		if result.ServiceErr != nil {
			t.Logf("Result: %+v", result)
			t.Logf("%+v", result.ServiceErr.Err)
		}

		assert.Equal(t, http.StatusUnauthorized, result.Status)
	})

	t.Run("Database Error", func(t *testing.T) {
		mockRow = &it.MockRow{}
		mockBuyerRow := &it.MockRow{}
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetUserByEmail, ctx, []any{"vendor@test.com"})
		it.SetupPoolQueryRow(mockPool, mockBuyerRow, repository.GetBuyerByEmail, ctx, []any{"vendor@test.com"})
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetVendorByEmail, ctx, []any{"vendor@test.com"})

		it.SetupScanNotExists(mockBuyerRow, errors.New("e"))

		Enver = MockEnver{}
		Hasher = MockHasher{}
		defer func() {
			Hasher = originalHasher
			Enver = originalEnver
		}()

		result := Login(ctx, mockPool, LoginUser{
			Email:    "vendor@test.com",
			Password: "correct",
		})

		if result.ServiceErr != nil {
			t.Logf("Result: %+v", result)
			t.Logf("%+v", result.ServiceErr.Err)
		}

		assert.Equal(t, http.StatusOK, result.Status)
		data := result.Data.(InfoWToken)
		assert.Equal(t, "vendor@test.com", data.Email)
		assert.NotEmpty(t, data.Token)
	})

	mockPool.AssertExpectations(t)
	mockRow.AssertExpectations(t)
}
