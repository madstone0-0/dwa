package transaction

import (
	"backend/db"
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

// GetTransactionsByVendorId retrieves transactions for a specific vendor by vendor ID
func GetTransactionsByVendorId(ctx context.Context, pool db.Pool, vId pgtype.UUID) utils.ServiceReturn[any] {
	// Create a new repository instance to interact with the database
	q := repository.New(pool)

	// Query the database to get transactions for the vendor
	transactions, err := q.GetTransactionsForVendor(ctx, vId)

	// If there is an error retrieving transactions, log the error and return an internal server error
	if err != nil {
		logging.Errorf("There was an error getting the transactions by vendor id")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	// Return a successful response with the transactions data
	return utils.ServiceReturn[any]{
		Status: http.StatusOK, // Success HTTP status code
		Data: utils.JMap{
			"transactions": transactions, // Transactions data returned
		},
	}
}

// GetTotalSalesByVendorId retrieves total sales for a specific vendor by vendor ID
func GetTotalSalesByVendorId(ctx context.Context, pool db.Pool, vId pgtype.UUID) utils.ServiceReturn[any] {
	// Create a new repository instance to interact with the database
	q := repository.New(pool)

	// Query the database to get the total sales for the vendor
	total_sales, err := q.GetTotalSales(ctx, vId)

	// If there is an error retrieving total sales, log the error and return an internal server error
	if err != nil {
		logging.Errorf("There was an error getting the total sales for the vendor")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	// Return a successful response with the total sales data
	return utils.ServiceReturn[any]{
		Status: http.StatusOK, // Success HTTP status code
		Data: utils.JMap{
			"total_sales": total_sales, // Total sales data returned
		},
	}
}

// GetTotalSalesByVendorIdAndItemId retrieves total sales for a specific vendor and item by their respective IDs
func GetTotalSalesByVendorIdAndItemId(ctx context.Context, pool db.Pool, vId pgtype.UUID, iId pgtype.UUID) utils.ServiceReturn[any] {
	// Create a new repository instance to interact with the database
	q := repository.New(pool)

	// Set the parameters for querying total sales for a specific vendor and item
	params := repository.GetTotalSalesForItemParams{Vid: vId, Iid: iId}

	// Query the database to get the total sales for the specific vendor and item
	total_sales, err := q.GetTotalSalesForItem(ctx, params)

	// If there is an error retrieving total sales, log the error and return an internal server error
	if err != nil {
		logging.Errorf("Error getting the total sales for item")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	// Return a successful response with the total sales data
	return utils.ServiceReturn[any]{
		Status: http.StatusOK, // Success HTTP status code
		Data: utils.JMap{
			"total_sales": total_sales, // Total sales data returned for the specific vendor and item
		},
	}
}
