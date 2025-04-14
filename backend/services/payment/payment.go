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
	item, err := q.GetItemById(ctx, transactionObj.Vid)

	if err != nil {
		logging.Errorf("There was an error fetching the item")
		return utils.MakeError(err, http.StatusBadRequest)
	}

	if item.Vid != transactionObj.Vid {
		logging.Errorf("There is a mismatch in the vid")
		err := errors.New("mismatch in vid")
		return utils.MakeError(err, http.StatusBadRequest)
	}

	err = q.CreateTransaction(ctx, transactionObj)
	if err != nil {
		logging.Errorf("There was an error creating the transction record")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
	}
}
