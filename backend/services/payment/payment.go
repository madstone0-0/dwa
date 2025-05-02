package payment

import (
	"backend/db"
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
)

// CreateTransactionRecord handles the process of creating a transaction,
// including validating item availability, reducing item quantity,
// and recording the transaction in the database.
func CreateTransactionRecord(ctx context.Context, pool db.Pool, transactionObj repository.CreateTransactionParams) utils.ServiceReturn[any] {
	// Create a new query handler from the database pool
	q := repository.New(pool)

	// Fetch the item details by ID from the database
	item, err := q.GetItemById(ctx, transactionObj.Iid)
	if err != nil {
		logging.Errorf("There was an error fetching the item")

		// If the item doesn't exist, return a 404 Not Found error
		if err == pgx.ErrNoRows {
			return utils.MakeError(errors.New("item not found"), http.StatusNotFound)
		}

		// Otherwise, return an internal server error
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	// Check for vendor ID mismatch
	if item.Vid != transactionObj.Vid {
		logging.Errorf("There is a mismatch in the vid")
		err = errors.New("mismatch in vid")
		return utils.MakeError(err, http.StatusBadRequest)
	}

	// Check for mismatch in transaction amount and item cost
	if !utils.NumericEqual(item.Cost, transactionObj.Amt) {
		logging.Errorf("There is an amount mismatch")
		err = errors.New("mismatch in amount")
		return utils.MakeError(err, http.StatusBadRequest)
	}

	// Check if enough quantity is available to fulfill the order
	if item.Quantity-transactionObj.QtyBought < 0 {
		logging.Errorf("You have bought more than is allowed")
		err = errors.New("bought more than the quantity available")
		return utils.MakeError(err, http.StatusBadRequest)
	}

	// Begin a new database transaction
	tx, err := pool.Begin(ctx)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}
	defer tx.Rollback(ctx) // Ensure rollback if transaction fails

	// Use the transaction in subsequent queries
	qtx := q.WithTx(tx)

	// Prepare parameters to reduce the item quantity
	params := repository.ReduceQuantityOfItemParams{
		Iid:      item.Iid,
		Vid:      item.Vid,
		Quantity: transactionObj.QtyBought,
	}

	// Reduce item quantity in the database
	err = qtx.ReduceQuantityOfItem(ctx, params)
	if err != nil {
		logging.Errorf("There was an error reducing the quantity of items")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	// Create the transaction record
	tid, err := qtx.CreateTransaction(ctx, transactionObj)
	if err != nil {
		logging.Errorf("There was an error creating the transaction record")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	// Commit the transaction to make changes permanent
	tx.Commit(ctx)

	// Return a successful response with the transaction ID
	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"tid": tid,
		},
	}
}
