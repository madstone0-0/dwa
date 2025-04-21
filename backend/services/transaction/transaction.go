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

func GetTransactionsByVendorId(ctx context.Context, pool db.Pool, vId pgtype.UUID) utils.ServiceReturn[any] {
	q := repository.New(pool)
	transactions, err := q.GetTransactionsForVendor(ctx, vId)

	if err != nil {
		logging.Errorf("There was an error getting the transactions by vendor id")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"transactions": transactions,
		},
	}

}

func GetTotalSalesByVendorId(ctx context.Context, pool db.Pool, vId pgtype.UUID) utils.ServiceReturn[any] {
	q := repository.New(pool)
	total_sales, err := q.GetTotalSales(ctx, vId)

	if err != nil {
		logging.Errorf("There was an error getting the total sales for the vendor")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"total_sales": total_sales,
		},
	}
}

func GetTotalSalesByVendorIdAndItemId(ctx context.Context, pool db.Pool, vId pgtype.UUID, iId pgtype.UUID) utils.ServiceReturn[any] {
	q := repository.New(pool)
	params := repository.GetTotalSalesForItemParams{Vid: vId, Iid: iId}
	total_sales, err := q.GetTotalSalesForItem(ctx, params)

	if err != nil {
		logging.Errorf("Error getting the total sales for item")
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"total_sales": total_sales,
		},
	}
}
