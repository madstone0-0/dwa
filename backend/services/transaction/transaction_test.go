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

// TestGetTransactionsByVendorId tests the function that retrieves transactions by vendor ID
func TestGetTransactionsByVendorId(t *testing.T) {
	// Context for the test
	ctx := context.Background()

	// Success case: mock database returns expected results
	t.Run("Success", func(t *testing.T) {
		// Mock the database pool, row, and rows for querying
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		mockRows := &it.MockRows{}

		// Test vendor ID and transaction data
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testTrans := repository.GetTransactionsForVendorRow{
			Name: utils.MakePointer("Balling"),
		}

		// Set up mock queries and results
		it.SetupMock(mockPool, "Query", []any{ctx, repository.GetTransactionsForVendor, []any{testVid}}, mockRows, nil)
		it.SetupMock(mockRows, "Close", []any{}, nil)
		it.SetupMock(mockRows, "Next", []any{}, true).Once()
		it.SetupMock(mockRows, "Next", []any{}, false).Once()
		it.SetupMock(mockRows, "Err", []any{}, nil)
		it.SetupMock(mockRows, "Scan", []any{mock.AnythingOfType("**string"), mock.Anything, mock.Anything}, nil).Run(func(args mock.Arguments) {
			// Mock scanning of transaction row
			if dest, ok := args.Get(0).(**string); ok {
				*dest = testTrans.Name
			}
		})

		// Call the function under test
		result := GetTransactionsByVendorId(ctx, mockPool, testVid)

		// Handle any errors
		if result.ServiceErr != nil {
			it.PrintError(result.ServiceErr.Err, t)
		}

		// Validate the results
		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusOK, result.Status)
		trans := result.Data.(utils.JMap)["transactions"].([]repository.GetTransactionsForVendorRow)
		assert.NotEmpty(t, trans)
		assert.Equal(t, trans[0].Name, testTrans.Name)

		// Verify that mocks were called as expected
		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)
	})

	// Error case: mock database returns an error
	t.Run("Get Transactions By Vendor Id error", func(t *testing.T) {
		// Mock the database pool and row for querying
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		mockRows := &it.MockRows{}

		// Test vendor ID
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}

		// Set up mock query to return an error
		it.SetupMock(mockPool, "Query", []any{ctx, repository.GetTransactionsForVendor, []any{testVid}}, mockRows, errors.New("e"))

		// Call the function under test
		result := GetTransactionsByVendorId(ctx, mockPool, testVid)

		// Validate that an error was returned
		assert.NotNil(t, result.ServiceErr)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)

		// Verify that mocks were called as expected
		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)
	})
}

// TestGetTotalSalesByVendorId tests the function that retrieves total sales by vendor ID
func TestGetTotalSalesByVendorId(t *testing.T) {
	// Context for the test
	ctx := context.Background()

	// Success case: mock database returns expected total sales
	t.Run("Success", func(t *testing.T) {
		// Mock the database pool and row for querying
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		var testTotalSales int64 = 200

		// Set up mock query and row scan for total sales
		it.SetupPoolQueryRow(mockPool, transRow, repository.GetTotalSales, ctx, []any{testVid})
		it.SetupMock(transRow, "Scan", []any{mock.Anything}, nil).Run(func(args mock.Arguments) {
			// Mock scanning of total sales value
			if dest, ok := args.Get(0).(*any); ok {
				*dest = testTotalSales
			}
		})

		// Call the function under test
		result := GetTotalSalesByVendorId(ctx, mockPool, testVid)

		// Validate the results
		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusOK, result.Status)
		totalSales := result.Data.(utils.JMap)["total_sales"].(int64)
		assert.Equal(t, testTotalSales, totalSales)

		// Verify that mocks were called as expected
		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)
	})

	// Error case: mock database returns an error while querying total sales
	t.Run("Get Total Sales By Vendor Id error", func(t *testing.T) {
		// Mock the database pool and row for querying
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}

		// Set up mock query to return an error
		it.SetupPoolQueryRow(mockPool, transRow, repository.GetTotalSales, ctx, []any{testVid})
		it.SetupMock(transRow, "Scan", []any{mock.Anything}, errors.New("e"))

		// Call the function under test
		result := GetTotalSalesByVendorId(ctx, mockPool, testVid)

		// Validate that an error was returned
		assert.NotNil(t, result.ServiceErr)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)

		// Verify that mocks were called as expected
		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)
	})
}

// TestGetTotalSalesByVendorIdAndItemId tests the function that retrieves total sales by vendor ID and item ID
func TestGetTotalSalesByVendorIdAndItemId(t *testing.T) {
	// Context for the test
	ctx := context.Background()

	// Success case: mock database returns expected total sales for vendor and item
	t.Run("Success", func(t *testing.T) {
		// Mock the database pool and row for querying
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		var testTotalSales int64 = 200

		// Set up mock query and row scan for total sales
		it.SetupPoolQueryRow(mockPool, transRow, repository.GetTotalSalesForItem, ctx, []any{testVid, testIid})
		it.SetupMock(transRow, "Scan", []any{mock.Anything}, nil).Run(func(args mock.Arguments) {
			// Mock scanning of total sales value
			if dest, ok := args.Get(0).(*any); ok {
				*dest = testTotalSales
			}
		})

		// Call the function under test
		result := GetTotalSalesByVendorIdAndItemId(ctx, mockPool, testVid, testIid)

		// Validate the results
		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusOK, result.Status)
		totalSales := result.Data.(utils.JMap)["total_sales"].(int64)
		assert.Equal(t, testTotalSales, totalSales)

		// Verify that mocks were called as expected
		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)
	})

	// Error case: mock database returns an error while querying total sales for vendor and item
	t.Run("Get Total sales by vendor Id and item Id error", func(t *testing.T) {
		// Mock the database pool and row for querying
		mockPool := &it.MockPool{}
		transRow := &it.MockRow{}
		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}

		// Set up mock query to return an error
		it.SetupPoolQueryRow(mockPool, transRow, repository.GetTotalSalesForItem, ctx, []any{testVid, testIid})
		it.SetupMock(transRow, "Scan", []any{mock.Anything}, errors.New("e"))

		// Call the function under test
		result := GetTotalSalesByVendorIdAndItemId(ctx, mockPool, testVid, testIid)

		// Validate that an error was returned
		assert.NotNil(t, result.ServiceErr)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)

		// Verify that mocks were called as expected
		transRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)
	})
}
