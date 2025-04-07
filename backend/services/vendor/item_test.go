package vendor

import (
	it "backend/internal/testing"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"errors"
	"math/big"
	"net/http"
	"testing"

	"github.com/jackc/pgx/v5"
	_ "github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func vendorScanExists(mockRow *it.MockRow) {
	it.SetupScanReturnArgs(mockRow, nil, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}
func itemScanExists(mockRow *it.MockRow) {
	it.SetupScanReturnArgs(mockRow, nil, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

func vendorScanNotExists(mockRow *it.MockRow, err error) {
	it.SetupScanReturnArgs(mockRow, err, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}
func itemScanNotExists(mockRow *it.MockRow, err error) {
	it.SetupScanReturnArgs(mockRow, err, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

func TestDoesVendorExistById(t *testing.T) {
	ctx := context.Background()
	mockPool := it.MockPool{}

	t.Run("Vendor exists", func(t *testing.T) {
		mockRow := &it.MockRow{}
		vendorScanExists(mockRow)
		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetVendorById, ctx, []any{testUUID})

		exists, err := doesVendorExistById(ctx, &mockPool, testUUID)

		assert.NoError(t, err)
		assert.True(t, exists)

		mockRow.AssertExpectations(t)
	})

	t.Run("Vendor not found", func(t *testing.T) {
		mockRow := &it.MockRow{}
		vendorScanNotExists(mockRow, pgx.ErrNoRows)
		testUUID := pgtype.UUID{Bytes: [16]byte{2}, Valid: true}
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetVendorById, ctx, []any{testUUID})

		exists, err := doesVendorExistById(ctx, &mockPool, testUUID)

		assert.NoError(t, err)
		assert.False(t, exists)

		mockRow.AssertExpectations(t)
	})

	t.Run("Database error", func(t *testing.T) {
		mockRow := &it.MockRow{}
		testUUID := pgtype.UUID{Bytes: [16]byte{3}, Valid: true}
		vendorScanNotExists(mockRow, errors.New("e"))
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetVendorById, ctx, []any{testUUID})

		_, err := doesVendorExistById(ctx, &mockPool, testUUID)

		assert.Error(t, err)

		mockRow.AssertExpectations(t)
	})

	mockPool.AssertExpectations(t)

}

func TestDoesItemExistByName(t *testing.T) {
	ctx := context.Background()
	mockPool := it.MockPool{}

	t.Run("Item exists", func(t *testing.T) {
		mockRow := &it.MockRow{}
		itemScanExists(mockRow)
		testName := "Schrodingers Cat 1"
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetItemByName, ctx, []any{testName})

		exists, err := doesItemExistByName(ctx, &mockPool, testName)

		assert.NoError(t, err)
		assert.True(t, exists)

		mockRow.AssertExpectations(t)
	})

	t.Run("Item not found", func(t *testing.T) {
		mockRow := &it.MockRow{}
		itemScanNotExists(mockRow, pgx.ErrNoRows)
		testName := "Schrodingers Cat 2"
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetItemByName, ctx, []any{testName})

		exists, err := doesItemExistByName(ctx, &mockPool, testName)

		assert.NoError(t, err)
		assert.False(t, exists)

		mockRow.AssertExpectations(t)
	})

	t.Run("Database error", func(t *testing.T) {
		mockRow := &it.MockRow{}
		testName := "Schrodingers Cat 3"
		itemScanNotExists(mockRow, errors.New("e"))
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetItemByName, ctx, []any{testName})

		_, err := doesItemExistByName(ctx, &mockPool, testName)

		assert.Error(t, err)

		mockRow.AssertExpectations(t)
	})

	mockPool.AssertExpectations(t)

}

func TestDoesItemExistById(t *testing.T) {
	ctx := context.Background()
	mockPool := it.MockPool{}

	t.Run("Item exists", func(t *testing.T) {
		mockRow := &it.MockRow{}
		it.SetupScanReturnArgs(mockRow, nil, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetItemById, ctx, []any{testUUID})

		exists, err := doesItemExistById(ctx, &mockPool, testUUID)

		assert.NoError(t, err)
		assert.True(t, exists)

		mockRow.AssertExpectations(t)
	})

	scanNotExists := func(mockRow *it.MockRow, err error) {
		it.SetupScanReturnArgs(mockRow, err, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
	}

	t.Run("Item not found", func(t *testing.T) {
		mockRow := &it.MockRow{}
		scanNotExists(mockRow, pgx.ErrNoRows)
		testUUID := pgtype.UUID{Bytes: [16]byte{2}, Valid: true}
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetItemById, ctx, []any{testUUID})

		exists, err := doesItemExistById(ctx, &mockPool, testUUID)

		assert.NoError(t, err)
		assert.False(t, exists)

		mockRow.AssertExpectations(t)
	})

	t.Run("Database error", func(t *testing.T) {
		mockRow := &it.MockRow{}
		scanNotExists(mockRow, errors.New("e"))
		testUUID := pgtype.UUID{Bytes: [16]byte{3}, Valid: true}
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetItemById, ctx, []any{testUUID})

		_, err := doesItemExistById(ctx, &mockPool, testUUID)

		assert.Error(t, err)

		mockRow.AssertExpectations(t)
	})

	mockPool.AssertExpectations(t)

}

func TestAll(t *testing.T) {
	ctx := context.Background()
	mockPool := &it.MockPool{}

	t.Run("Success", func(t *testing.T) {
		mockRow := &it.MockRow{}
		mockRows := &it.MockRows{}
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testItem := repository.Item{
			Iid:         pgtype.UUID{Bytes: [16]byte{1}, Valid: true},
			Vid:         testVid,
			Name:        "Schrodingers Cat",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100)},
		}

		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetVendorById, ctx, []any{testVid})
		it.SetupPoolOnRet(mockPool, "Query", repository.GetItemsByVendorId, ctx, []any{testVid}, mockRows, nil)
		it.SetupMock(mockRows, "Close", []any{}, nil)
		it.SetupMock(mockRows, "Next", []any{}, true).Once()
		it.SetupMock(mockRows, "Next", []any{}, false).Once()
		it.SetupMock(mockRows, "Err", []any{}, nil)
		it.SetupMock(mockRows, "Scan", []any{mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything}, nil).Run(
			func(args mock.Arguments) {
				if dest, ok := args.Get(0).(*pgtype.UUID); ok {
					*dest = testItem.Iid
				}
				if dest, ok := args.Get(1).(*pgtype.UUID); ok {
					*dest = testItem.Vid
				}
				if dest, ok := args.Get(2).(*string); ok {
					*dest = testItem.Name
				}
				if dest, ok := args.Get(3).(**string); ok {
					*dest = testItem.Pictureurl
				}
				if dest, ok := args.Get(4).(**string); ok {
					*dest = testItem.Description
				}
				if dest, ok := args.Get(5).(*pgtype.Numeric); ok {
					*dest = testItem.Cost
				}
			},
		)
		vendorScanExists(mockRow)

		result := All(ctx, mockPool, testVid)

		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusOK, result.Status)
		items := result.Data.(utils.JMap)["items"].([]repository.Item)
		assert.Equal(t, 1, len(items))
		assert.Equal(t, testItem.Iid, items[0].Iid)
		assert.Equal(t, testItem.Vid, items[0].Vid)
		assert.Equal(t, testItem.Name, items[0].Name)
		assert.Equal(t, *testItem.Pictureurl, *items[0].Pictureurl)
		assert.Equal(t, *testItem.Description, *items[0].Description)
		assert.Equal(t, testItem.Cost, items[0].Cost)
		mockRow.AssertExpectations(t)
		mockRows.AssertExpectations(t)
	})

	t.Run("Vendor Not Found", func(t *testing.T) {
		mockRow := &it.MockRow{}
		testVid := pgtype.UUID{Bytes: [16]byte{2}, Valid: true}
		vendorScanNotExists(mockRow, pgx.ErrNoRows)
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetVendorById, ctx, []any{testVid})

		result := All(ctx, mockPool, testVid)

		assert.NotNil(t, result.ServiceErr)
		assert.Equal(t, http.StatusNotFound, result.ServiceErr.Status)
		mockRow.AssertExpectations(t)
	})

	t.Run("Items Query Error", func(t *testing.T) {
		mockRow := &it.MockRow{}
		mockRows := &it.MockRows{}
		testVid := pgtype.UUID{Bytes: [16]byte{3}, Valid: true}
		vendorScanExists(mockRow)
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetVendorById, ctx, []any{testVid})
		it.SetupPoolOnRet(mockPool, "Query", repository.GetItemsByVendorId, ctx, []any{testVid}, mockRows, errors.New("db error"))

		result := All(ctx, mockPool, testVid)

		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)
		mockRow.AssertExpectations(t)
	})

	mockPool.AssertExpectations(t)
}
