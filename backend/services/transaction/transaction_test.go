package transaction

import (
	it "backend/internal/testing"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"errors"
	"net/http"
	"testing"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestGetTransactionsByVendorId(t *testing.T) {
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		mockRows := &it.MockRows{}

		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testTrans := repository.GetTransactionsForVendorRow{
			Name: utils.MakePointer("Balling"),
		}

		it.SetupMock(mockPool, "Query", []any{ctx, repository.GetTransactionsForVendor, []any{testVid}}, mockRows, nil)
		it.SetupMock(mockRows, "Close", []any{}, nil)
		it.SetupMock(mockRows, "Next", []any{}, true).Once()
		it.SetupMock(mockRows, "Next", []any{}, false).Once()
		it.SetupMock(mockRows, "Err", []any{}, nil)
		it.SetupMock(mockRows, "Scan", []any{mock.AnythingOfType("**string"), mock.Anything, mock.Anything}, nil).Run(func(args mock.Arguments) {
			if dest, ok := args.Get(0).(**string); ok {
				*dest = testTrans.Name
			}
		})

		result := GetTransactionsByVendorId(ctx, mockPool, testVid)
		if result.ServiceErr != nil {
			it.PrintError(result.ServiceErr.Err, t)
		}

		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusOK, result.Status)
		trans := result.Data.(utils.JMap)["transactions"].([]repository.GetTransactionsForVendorRow)
		assert.NotEmpty(t, trans)
		assert.Equal(t, trans[0].Name, testTrans.Name)

		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)

	})

	t.Run("Get Transactions By Vendor Id error", func(t *testing.T) {
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		mockRows := &it.MockRows{}

		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}

		it.SetupMock(mockPool, "Query", []any{ctx, repository.GetTransactionsForVendor, []any{testVid}}, mockRows, errors.New("e"))

		result := GetTransactionsByVendorId(ctx, mockPool, testVid)

		assert.NotNil(t, result.ServiceErr)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)

		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)

	})
}

func TestGetTotalSalesByVendorId(t *testing.T) {
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		var testTotalSales int64 = 200

		it.SetupPoolQueryRow(mockPool, transRow, repository.GetTotalSales, ctx, []any{testVid})
		it.SetupMock(transRow, "Scan", []any{mock.Anything}, nil).Run(func(args mock.Arguments) {
			if dest, ok := args.Get(0).(*any); ok {
				*dest = testTotalSales
			}
		})

		result := GetTotalSalesByVendorId(ctx, mockPool, testVid)

		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusOK, result.Status)
		totalSales := result.Data.(utils.JMap)["total_sales"].(int64)
		assert.Equal(t, testTotalSales, totalSales)

		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)

	})

	t.Run("Get Total Sales By Vendor Id error", func(t *testing.T) {
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}

		it.SetupPoolQueryRow(mockPool, transRow, repository.GetTotalSales, ctx, []any{testVid})
		it.SetupMock(transRow, "Scan", []any{mock.Anything}, errors.New("e"))

		result := GetTotalSalesByVendorId(ctx, mockPool, testVid)

		assert.NotNil(t, result.ServiceErr)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)

		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)
	})
}

func TestGetTotalSalesByVendorIdAndItemId(t *testing.T) {
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		var testTotalSales int64 = 200

		it.SetupPoolQueryRow(mockPool, transRow, repository.GetTotalSalesForItem, ctx, []any{testVid, testIid})
		it.SetupMock(transRow, "Scan", []any{mock.Anything}, nil).Run(func(args mock.Arguments) {
			if dest, ok := args.Get(0).(*any); ok {
				*dest = testTotalSales
			}
		})

		result := GetTotalSalesByVendorIdAndItemId(ctx, mockPool, testVid, testIid)

		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusOK, result.Status)
		totalSales := result.Data.(utils.JMap)["total_sales"].(int64)
		assert.Equal(t, testTotalSales, totalSales)

		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)

	})

	t.Run("Get Total sales by vendor Id and item Id error", func(t *testing.T) {
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}

		it.SetupPoolQueryRow(mockPool, transRow, repository.GetTotalSalesForItem, ctx, []any{testVid, testIid})
		it.SetupMock(transRow, "Scan", []any{mock.Anything}, errors.New("e"))

		result := GetTotalSalesByVendorIdAndItemId(ctx, mockPool, testVid, testIid)

		assert.NotNil(t, result.ServiceErr)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)

		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)

	})
}
