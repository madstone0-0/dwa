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
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestDoesVendorExistById(t *testing.T) {
	ctx := context.Background()
	mockPool := it.MockPool{}

	t.Run("Vendor exists", func(t *testing.T) {
		mockRow := &it.MockRow{}
		it.VendorScanExists(mockRow)
		testUUID := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetVendorById, ctx, []any{testUUID})

		exists, err := doesVendorExistById(ctx, &mockPool, testUUID)

		it.PrintError(err, t)

		assert.NoError(t, err)
		assert.True(t, exists)

		mockRow.AssertExpectations(t)
	})

	t.Run("Vendor not found", func(t *testing.T) {
		mockRow := &it.MockRow{}
		it.VendorScanNotExists(mockRow, pgx.ErrNoRows)
		testUUID := pgtype.UUID{Bytes: [16]byte{2}, Valid: true}
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetVendorById, ctx, []any{testUUID})

		exists, err := doesVendorExistById(ctx, &mockPool, testUUID)

		it.PrintError(err, t)

		assert.NoError(t, err)
		assert.False(t, exists)

		mockRow.AssertExpectations(t)
	})

	t.Run("Database error", func(t *testing.T) {
		mockRow := &it.MockRow{}
		testUUID := pgtype.UUID{Bytes: [16]byte{3}, Valid: true}
		it.VendorScanNotExists(mockRow, errors.New("e"))
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
		it.ItemScanExists(mockRow)
		testName := "Schrodinger's Cat 1"
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetItemByName, ctx, []any{testName})

		exists, err := doesItemExistByName(ctx, &mockPool, testName)

		it.PrintError(err, t)

		assert.NoError(t, err)
		assert.True(t, exists)

		mockRow.AssertExpectations(t)
	})

	t.Run("Item not found", func(t *testing.T) {
		mockRow := &it.MockRow{}
		it.ItemScanNotExists(mockRow, pgx.ErrNoRows)
		testName := "Schrodinger's Cat 2"
		it.SetupPoolQueryRow(&mockPool, mockRow, repository.GetItemByName, ctx, []any{testName})

		exists, err := doesItemExistByName(ctx, &mockPool, testName)

		it.PrintError(err, t)

		assert.NoError(t, err)
		assert.False(t, exists)

		mockRow.AssertExpectations(t)
	})

	t.Run("Database error", func(t *testing.T) {
		mockRow := &it.MockRow{}
		testName := "Schrodinger's Cat 3"
		it.ItemScanNotExists(mockRow, errors.New("e"))
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

		// Sample item and Vid for testing
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testItem := repository.Item{
			Iid:         pgtype.UUID{Bytes: [16]byte{1}, Valid: true},
			Vid:         testVid,
			Name:        "Schrodinger's Cat 1",
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
		// Assign values to the pointers passed to Scan when a select operation is performed
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
		it.VendorScanExists(mockRow)

		result := All(ctx, mockPool, testVid)

		if result.ServiceErr != nil {
			it.PrintError(result.ServiceErr.Err, t)
		}

		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusOK, result.Status)
		items := result.Data.(utils.JMap)["items"].([]repository.Item)
		// Check that all the values are correct
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
		it.VendorScanNotExists(mockRow, pgx.ErrNoRows)
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetVendorById, ctx, []any{testVid})

		result := All(ctx, mockPool, testVid)

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusNotFound, result.ServiceErr.Status)
		mockRow.AssertExpectations(t)
	})

	t.Run("Items Query Error", func(t *testing.T) {
		mockRow := &it.MockRow{}
		mockRows := &it.MockRows{}
		testVid := pgtype.UUID{Bytes: [16]byte{3}, Valid: true}
		it.VendorScanExists(mockRow)
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetVendorById, ctx, []any{testVid})
		it.SetupPoolOnRet(mockPool, "Query", repository.GetItemsByVendorId, ctx, []any{testVid}, mockRows, errors.New("db error"))

		result := All(ctx, mockPool, testVid)

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)
		mockRow.AssertExpectations(t)
	})

	mockPool.AssertExpectations(t)
}

func TestAdd(t *testing.T) {
	ctx := context.Background()
	mockPool := &it.MockPool{}

	t.Run("Success", func(t *testing.T) {
		vendorRow := &it.MockRow{}
		itemRow := &it.MockRow{}
		mockRows := &it.MockRows{}

		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testItem := repository.InsertItemParams{
			Vid:         testVid,
			Name:        "Schrodinger's Cat 1",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100)},
		}

		it.SetupPoolQueryRow(mockPool, itemRow, repository.InsertItem, ctx, []any{
			testVid,
			testItem.Name,
			testItem.Pictureurl,
			testItem.Description,
			testItem.Cost,
		})
		it.SetupPoolQueryRow(mockPool, vendorRow, repository.GetVendorById, ctx, []any{testVid})
		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemByName, ctx, []any{testItem.Name})
		it.SetupMock(itemRow, "Scan",
			[]any{
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("*pgtype.Numeric"),
			},
			pgx.ErrNoRows)
		// Assign test Iid to the iid pointer passed to Scan when a select operation is performed
		it.SetupMock(itemRow, "Scan", []any{mock.AnythingOfType("*pgtype.UUID")}, nil).Run(func(args mock.Arguments) {
			if dest, ok := args.Get(0).(*pgtype.UUID); ok {
				*dest = testIid
			}
		})
		it.VendorScanExists(vendorRow)

		result := Add(ctx, mockPool, testItem)

		if result.ServiceErr != nil {
			it.PrintError(result.ServiceErr.Err, t)
		}

		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusCreated, result.Status)
		iid := result.Data.(utils.JMap)["iid"].(pgtype.UUID)
		assert.NotNil(t, iid)
		assert.Equal(t, testIid, iid)
		vendorRow.AssertExpectations(t)
		mockRows.AssertExpectations(t)
	})

	t.Run("Vendor not found", func(t *testing.T) {
		mockRow := &it.MockRow{}
		testVid := pgtype.UUID{Bytes: [16]byte{2}, Valid: true}
		testItem := repository.InsertItemParams{
			Vid:         testVid,
			Name:        "Schrodinger's Cat 2",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100)},
		}
		it.VendorScanNotExists(mockRow, pgx.ErrNoRows)
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetVendorById, ctx, []any{testVid})

		result := Add(ctx, mockPool, testItem)

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusNotFound, result.ServiceErr.Status)
		mockRow.AssertExpectations(t)
	})

	t.Run("Item already exists", func(t *testing.T) {
		vendorRow := &it.MockRow{}
		itemRow := &it.MockRow{}
		mockRows := &it.MockRows{}

		testVid := pgtype.UUID{Bytes: [16]byte{3}, Valid: true}
		testItem := repository.InsertItemParams{
			Vid:         testVid,
			Name:        "Schrodinger's Cat 3",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100)},
		}

		it.SetupPoolQueryRow(mockPool, vendorRow, repository.GetVendorById, ctx, []any{testVid})
		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemByName, ctx, []any{testItem.Name})
		it.ItemScanExists(itemRow)
		it.VendorScanExists(vendorRow)

		result := Add(ctx, mockPool, testItem)

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusConflict, result.ServiceErr.Status)
		vendorRow.AssertExpectations(t)
		itemRow.AssertExpectations(t)
		mockRows.AssertExpectations(t)
	})

	t.Run("Insert error", func(t *testing.T) {
		vendorRow := &it.MockRow{}
		itemRow := &it.MockRow{}
		mockRows := &it.MockRows{}

		testVid := pgtype.UUID{Bytes: [16]byte{4}, Valid: true}
		testItem := repository.InsertItemParams{
			Vid:         testVid,
			Name:        "Schrodinger's Cat 4",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100)},
		}

		it.SetupPoolQueryRow(mockPool, itemRow, repository.InsertItem, ctx, []any{
			testVid,
			testItem.Name,
			testItem.Pictureurl,
			testItem.Description,
			testItem.Cost,
		})
		it.SetupPoolQueryRow(mockPool, vendorRow, repository.GetVendorById, ctx, []any{testVid})
		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemByName, ctx, []any{testItem.Name})
		it.SetupMock(itemRow, "Scan",
			[]any{
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("*pgtype.Numeric"),
			},
			pgx.ErrNoRows)
		it.SetupMock(itemRow, "Scan", []any{mock.AnythingOfType("*pgtype.UUID")}, errors.New("e"))
		it.VendorScanExists(vendorRow)

		result := Add(ctx, mockPool, testItem)

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)
		itemRow.AssertExpectations(t)
		mockRows.AssertExpectations(t)
	})

	mockPool.AssertExpectations(t)
}

func TestUpdate(t *testing.T) {
	ctx := context.Background()
	mockPool := &it.MockPool{}

	t.Run("Success", func(t *testing.T) {
		vendorRow := &it.MockRow{}
		itemRow := &it.MockRow{}
		mockRows := &it.MockRows{}

		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testItem := repository.UpdateItemParams{
			Iid:         testIid,
			Vid:         testVid,
			Name:        "Schrodinger's Cat 1",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100)},
		}

		it.SetupPoolQueryRow(mockPool, vendorRow, repository.GetVendorById, ctx, []any{testVid})
		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemById, ctx, []any{testItem.Iid})
		execCall := it.SetupMock(mockPool, "Exec", []any{
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
		}, pgconn.CommandTag{}, nil)
		it.SetupMock(itemRow, "Scan",
			[]any{
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("*pgtype.Numeric"),
			},
			nil)
		it.SetupMock(itemRow, "Scan", []any{mock.AnythingOfType("*pgtype.UUID")}, nil).Run(func(args mock.Arguments) {
			if dest, ok := args.Get(0).(*pgtype.UUID); ok {
				*dest = testIid
			}
		})
		it.VendorScanExists(vendorRow)

		result := Update(ctx, mockPool, testItem)

		if result.ServiceErr != nil {
			it.PrintError(result.ServiceErr.Err, t)
		}

		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusOK, result.Status)
		msg := result.Data.(utils.JMap)["msg"].(string)
		assert.NotNil(t, msg)
		assert.Equal(t, "Item updated", msg)
		vendorRow.AssertExpectations(t)
		mockRows.AssertExpectations(t)
		execCall.Unset()
	})

	t.Run("Vendor not found", func(t *testing.T) {
		mockRow := &it.MockRow{}
		testVid := pgtype.UUID{Bytes: [16]byte{2}, Valid: true}
		testItem := repository.InsertItemParams{
			Vid:         testVid,
			Name:        "Schrodinger's Cat 2",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100)},
		}
		it.VendorScanNotExists(mockRow, pgx.ErrNoRows)
		it.SetupPoolQueryRow(mockPool, mockRow, repository.GetVendorById, ctx, []any{testVid})

		result := Add(ctx, mockPool, testItem)

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusNotFound, result.ServiceErr.Status)
		mockRow.AssertExpectations(t)
	})

	t.Run("Item already exists", func(t *testing.T) {
		vendorRow := &it.MockRow{}
		itemRow := &it.MockRow{}
		mockRows := &it.MockRows{}

		testVid := pgtype.UUID{Bytes: [16]byte{3}, Valid: true}
		// testIid := pgtype.UUID{Bytes: [16]byte{2}, Valid: true}
		testItem := repository.InsertItemParams{
			Vid:         testVid,
			Name:        "Schrodinger's Cat 3",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100)},
		}

		it.SetupPoolQueryRow(mockPool, vendorRow, repository.GetVendorById, ctx, []any{testVid})
		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemByName, ctx, []any{testItem.Name})
		it.ItemScanExists(itemRow)
		it.VendorScanExists(vendorRow)

		result := Add(ctx, mockPool, testItem)

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusConflict, result.ServiceErr.Status)
		vendorRow.AssertExpectations(t)
		itemRow.AssertExpectations(t)
		mockRows.AssertExpectations(t)
	})

	t.Run("Update error", func(t *testing.T) {
		vendorRow := &it.MockRow{}
		itemRow := &it.MockRow{}
		mockRows := &it.MockRows{}

		testVid := pgtype.UUID{Bytes: [16]byte{4}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{4}, Valid: true}
		testItem := repository.UpdateItemParams{
			Iid:         testIid,
			Vid:         testVid,
			Name:        "Schrodinger's Cat 4",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100)},
		}

		it.SetupPoolQueryRow(mockPool, vendorRow, repository.GetVendorById, ctx, []any{testVid})
		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemById, ctx, []any{testItem.Iid})
		it.SetupMock(mockPool, "Exec", []any{
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
		}, pgconn.CommandTag{}, errors.New("e"))
		it.SetupMock(itemRow, "Scan",
			[]any{
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("*pgtype.Numeric"),
			},
			nil)
		it.SetupMock(itemRow, "Scan", []any{mock.AnythingOfType("*pgtype.UUID")}, nil).Run(func(args mock.Arguments) {
			if dest, ok := args.Get(0).(*pgtype.UUID); ok {
				*dest = testIid
			}
		})
		it.VendorScanExists(vendorRow)

		result := Update(ctx, mockPool, testItem)

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)
		vendorRow.AssertExpectations(t)
		mockRows.AssertExpectations(t)
	})

	mockPool.AssertExpectations(t)
}

func TestDelete(t *testing.T) {
	ctx := context.Background()
	mockPool := &it.MockPool{}

	t.Run("Success", func(t *testing.T) {
		itemRow := &it.MockRow{}

		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}

		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemById, ctx, []any{testIid})
		it.SetupMock(itemRow, "Scan",
			[]any{
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("*pgtype.Numeric"),
			},
			nil)
		execCall := it.SetupMock(mockPool, "Exec", []any{
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
		}, pgconn.CommandTag{}, nil)
		it.ItemScanExists(itemRow)

		result := Delete(ctx, mockPool, testIid)

		if result.ServiceErr != nil {
			it.PrintError(result.ServiceErr.Err, t)
		}

		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusOK, result.Status)
		execCall.Unset()

	})

	t.Run("Item not found", func(t *testing.T) {
		itemRow := &it.MockRow{}

		testIid := pgtype.UUID{Bytes: [16]byte{2}, Valid: true}

		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemById, ctx, []any{testIid})
		it.SetupMock(itemRow, "Scan",
			[]any{
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("*pgtype.Numeric"),
			},
			pgx.ErrNoRows)
		it.ItemScanNotExists(itemRow, pgx.ErrNoRows)

		result := Delete(ctx, mockPool, testIid)

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusNotFound, result.ServiceErr.Status)
		itemRow.AssertExpectations(t)
	})

	t.Run("Delete error", func(t *testing.T) {
		itemRow := &it.MockRow{}

		testIid := pgtype.UUID{Bytes: [16]byte{3}, Valid: true}

		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemById, ctx, []any{testIid})
		it.SetupMock(itemRow, "Scan",
			[]any{
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*pgtype.UUID"),
				mock.AnythingOfType("*string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("**string"),
				mock.AnythingOfType("*pgtype.Numeric"),
			},
			nil)
		it.SetupMock(mockPool, "Exec", []any{
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
		}, pgconn.CommandTag{}, errors.New("e"))
		it.ItemScanExists(itemRow)

		result := Delete(ctx, mockPool, testIid)

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)
		itemRow.AssertExpectations(t)
	})

	mockPool.AssertExpectations(t)
}
