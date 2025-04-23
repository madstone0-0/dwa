package payment

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
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestCreateTransactionRecord(t *testing.T) {
	ctx := context.Background()

	t.Run("Success", func(t *testing.T) {
		mockPool := &it.MockPool{}
		itemRow := &it.MockRow{}

		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testBid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testTid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testTrans := repository.CreateTransactionParams{
			Bid: testBid,
			Vid: testVid,
			Iid: testIid,
			Amt: pgtype.Numeric{Int: big.NewInt(100), Valid: true},
		}
		testItem := repository.Item{
			Iid:         testIid,
			Vid:         testVid,
			Name:        "Schrodinger's Cat 1",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100), Valid: true},
		}

		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemById, ctx, []any{testIid})
		it.SetupPoolQueryRow(mockPool, itemRow, repository.CreateTransaction, ctx, []any{
			testTrans.Bid,
			testTrans.Iid,
			testTrans.Vid,
			testTrans.Amt,
		})
		it.SetupMock(itemRow, "Scan", []any{mock.AnythingOfType("*pgtype.UUID")}, nil).Run(func(args mock.Arguments) {
			if dest, ok := args.Get(0).(*pgtype.UUID); ok {
				*dest = testTid
			}
		})
		it.SetupMock(itemRow, "Scan", []any{
			mock.AnythingOfType("*pgtype.UUID"),
			mock.AnythingOfType("*pgtype.UUID"),
			mock.AnythingOfType("*string"),
			mock.AnythingOfType("**string"),
			mock.AnythingOfType("**string"),
			mock.AnythingOfType("*pgtype.Numeric")}, nil).Run(
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

		result := CreateTransactionRecord(ctx, mockPool, testTrans)
		if result.ServiceErr != nil {
			it.PrintError(result.ServiceErr.Err, t)
		}

		assert.Nil(t, result.ServiceErr)
		assert.Equal(t, http.StatusOK, result.Status)
		tid := result.Data.(utils.JMap)["tid"].(pgtype.UUID)
		assert.NotNil(t, tid)
		assert.Equal(t, testTid, tid)

		itemRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)
	})

	t.Run("Item not found", func(t *testing.T) {
		mockPool := &it.MockPool{}
		itemRow := &it.MockRow{}

		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testBid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testTrans := repository.CreateTransactionParams{
			Bid: testBid,
			Vid: testVid,
			Iid: testIid,
			Amt: pgtype.Numeric{Int: big.NewInt(100), Valid: true},
		}
		testItem := repository.Item{
			Iid: testIid,
		}

		it.ItemScanNotExists(itemRow, pgx.ErrNoRows)
		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemById, ctx, []any{testItem.Iid})

		result := CreateTransactionRecord(ctx, mockPool, testTrans)

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusNotFound, result.ServiceErr.Status)

		itemRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)
	})

	t.Run("Vendor Id mismatch", func(t *testing.T) {
		mockPool := &it.MockPool{}
		itemRow := &it.MockRow{}

		testVid1 := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testVid2 := pgtype.UUID{Bytes: [16]byte{2}, Valid: true}
		testBid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testTid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testTrans := repository.CreateTransactionParams{
			Bid: testBid,
			Vid: testVid1,
			Iid: testIid,
			Amt: pgtype.Numeric{Int: big.NewInt(100), Valid: true},
		}
		testItem := repository.Item{
			Iid:         testIid,
			Vid:         testVid2,
			Name:        "Schrodinger's Cat 1",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100), Valid: true},
		}

		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemById, ctx, []any{testIid})
		it.SetupMock(itemRow, "Scan", []any{mock.AnythingOfType("*pgtype.UUID")}, nil).Run(func(args mock.Arguments) {
			if dest, ok := args.Get(0).(*pgtype.UUID); ok {
				*dest = testTid
			}
		})
		it.SetupMock(itemRow, "Scan", []any{
			mock.AnythingOfType("*pgtype.UUID"),
			mock.AnythingOfType("*pgtype.UUID"),
			mock.AnythingOfType("*string"),
			mock.AnythingOfType("**string"),
			mock.AnythingOfType("**string"),
			mock.AnythingOfType("*pgtype.Numeric")}, nil).Run(
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

		result := CreateTransactionRecord(ctx, mockPool, testTrans)
		if result.ServiceErr != nil {
			it.PrintError(result.ServiceErr.Err, t)
		}

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusBadRequest, result.ServiceErr.Status)

		mockPool.AssertExpectations(t)
	})

	t.Run("Insufficient funds", func(t *testing.T) {
		mockPool := &it.MockPool{}
		itemRow := &it.MockRow{}

		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testBid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testTid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testTrans := repository.CreateTransactionParams{
			Bid: testBid,
			Vid: testVid,
			Iid: testIid,
			Amt: pgtype.Numeric{Int: big.NewInt(20), Valid: true},
		}
		testItem := repository.Item{
			Iid:         testIid,
			Vid:         testVid,
			Name:        "Schrodinger's Cat 1",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100), Valid: true},
		}

		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemById, ctx, []any{testIid})
		it.SetupMock(itemRow, "Scan", []any{mock.AnythingOfType("*pgtype.UUID")}, nil).Run(func(args mock.Arguments) {
			if dest, ok := args.Get(0).(*pgtype.UUID); ok {
				*dest = testTid
			}
		})
		it.SetupMock(itemRow, "Scan", []any{
			mock.AnythingOfType("*pgtype.UUID"),
			mock.AnythingOfType("*pgtype.UUID"),
			mock.AnythingOfType("*string"),
			mock.AnythingOfType("**string"),
			mock.AnythingOfType("**string"),
			mock.AnythingOfType("*pgtype.Numeric")}, nil).Run(
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

		result := CreateTransactionRecord(ctx, mockPool, testTrans)
		if result.ServiceErr != nil {
			it.PrintError(result.ServiceErr.Err, t)
		}

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusBadRequest, result.ServiceErr.Status)

		mockPool.AssertExpectations(t)
	})

	t.Run("CreateTransactionRecord error", func(t *testing.T) {
		mockPool := &it.MockPool{}
		itemRow := &it.MockRow{}

		testVid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testBid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testIid := pgtype.UUID{Bytes: [16]byte{1}, Valid: true}
		testTrans := repository.CreateTransactionParams{
			Bid: testBid,
			Vid: testVid,
			Iid: testIid,
			Amt: pgtype.Numeric{Int: big.NewInt(100), Valid: true},
		}
		testItem := repository.Item{
			Iid:         testIid,
			Vid:         testVid,
			Name:        "Schrodinger's Cat 1",
			Pictureurl:  utils.MakePointer("https://example.com/cat.jpg"),
			Description: utils.MakePointer("Probably dead"),
			Cost:        pgtype.Numeric{Int: big.NewInt(100), Valid: true},
		}

		it.SetupPoolQueryRow(mockPool, itemRow, repository.GetItemById, ctx, []any{testIid})
		it.SetupPoolQueryRow(mockPool, itemRow, repository.CreateTransaction, ctx, []any{
			testTrans.Bid,
			testTrans.Iid,
			testTrans.Vid,
			testTrans.Amt,
		})
		it.SetupMock(itemRow, "Scan", []any{mock.AnythingOfType("*pgtype.UUID")}, errors.New("e"))
		it.SetupMock(itemRow, "Scan", []any{
			mock.AnythingOfType("*pgtype.UUID"),
			mock.AnythingOfType("*pgtype.UUID"),
			mock.AnythingOfType("*string"),
			mock.AnythingOfType("**string"),
			mock.AnythingOfType("**string"),
			mock.AnythingOfType("*pgtype.Numeric")}, nil).Run(
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

		result := CreateTransactionRecord(ctx, mockPool, testTrans)
		if result.ServiceErr != nil {
			it.PrintError(result.ServiceErr.Err, t)
		}

		assert.NotNil(t, result.ServiceErr)
		assert.Error(t, result.ServiceErr.Err)
		assert.Equal(t, http.StatusInternalServerError, result.ServiceErr.Status)

		itemRow.AssertExpectations(t)
		mockPool.AssertExpectations(t)
	})

}
