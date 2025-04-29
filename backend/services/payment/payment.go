package payment

import (
	"backend/db"
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"errors"
	"net/http"
)

func CreateTransactionRecord(ctx context.Context, pool db.Pool, transactionObj repository.CreateTransactionParams) utils.ServiceReturn[any] {
	q := repository.New(pool)
	item, err := q.GetItemById(ctx, transactionObj.Iid)

	if err != nil {
		logging.Errorf("There was an error fetching the item")
		return utils.MakeError(err, http.StatusNotFound)
	}

	if item.Vid != transactionObj.Vid {
		logging.Errorf("There is a mismatch in the vid")
		err = errors.New("mismatch in vid")
		return utils.MakeError(err, http.StatusBadRequest)
	}

	if item.Cost.Int.Cmp(transactionObj.Amt.Int) != 0 {
		logging.Errorf("There is an amount mismatch")
		err = errors.New("mismatch in amount")
		return utils.MakeError(err, http.StatusBadRequest)
	}

	if item.Quantity-transactionObj.QtyBought < 0 {
		logging.Errorf("You have bought more than is allowed")
		err = errors.New("bought more than the quantity available")
		return utils.MakeError(err, http.StatusBadRequest)
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return utils.MakeError(err, http.StatusInternalServerError)
	}
	defer tx.Rollback(ctx)
	qtx := q.WithTx(tx)

	params := repository.ReduceQuantityOfItemParams{Iid: item.Iid, Vid: item.Vid, Quantity: transactionObj.QtyBought}
	_err := qtx.ReduceQuantityOfItem(ctx, params)

	if _err != nil {
		logging.Errorf("There was an error reducing the quantity of items")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	tid, err := qtx.CreateTransaction(ctx, transactionObj)
	if err != nil {
		logging.Errorf("There was an error creating the transaction record")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	tx.Commit(ctx)

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"tid": tid,
		},
	}
}
