package testing

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stretchr/testify/mock"
)

// SetupScanWithUUID sets up the mock row to scan a UUID value into the destination
func SetupScanWithUUID(mockRow *MockRow, uid pgtype.UUID) {
	mockRow.On("Scan", mock.Anything).Run(func(args mock.Arguments) {
		if dest, ok := args.Get(0).(*pgtype.UUID); ok {
			*dest = uid
		}
	}).Return(nil)
}

// SetupScanReturnArgs sets up the mock row to return a specific value when scanning with additional arguments
// also returns the mock.Call object for additional assertions
func SetupScanReturnArgs(mockRow *MockRow, ret any, args ...any) *mock.Call {
	return mockRow.On("Scan", args...).Return(ret)
}

// SetupScanReturn sets up the mock row to return a specific value when scanning also returns
// the mock.Call object for additional assertions
func SetupScanReturn(mockRow *MockRow, ret any) *mock.Call {
	return SetupScanReturnArgs(mockRow, ret, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

// SetupScanExists sets up the mock row to return a nil error indicating rows exist
// also returns the mock.Call object for additional assertions
func SetupScanExists(mockRow *MockRow) *mock.Call {
	return SetupScanReturn(mockRow, nil)
}

// SetupScanNotExists sets up the mock row to return a non-nil error indicating rows do not exist
// also returns the mock.Call object for additional assertions
func SetupScanNotExists(mockRow *MockRow, err error) *mock.Call {
	return SetupScanReturn(mockRow, err)
}

// SetupPoolQueryRow sets up the mock pool to return a mock row when the query is executed
// also returns the mock.Call object for additional assertions
func SetupPoolQueryRow(mockPool *MockPool, mockRow *MockRow, sqlCmd string, ctx context.Context, extra []any) *mock.Call {
	return mockPool.On("QueryRow", ctx, sqlCmd, extra).
		Return(mockRow)
}

// SetupTxQueryRow sets up the mock transaction to return a mock row when the query is executed
// also returns the mock.Call object for additional assertions
func SetupTxQueryRow(mockTx *MockTx, mockRow *MockRow, sqlCmd string, ctx context.Context, extra []any) *mock.Call {
	return mockTx.On("QueryRow", ctx, sqlCmd, extra).
		Return(mockRow)
}

// SetupTxOnRet sets up the mock transaction to return a specific value when the on method is called
// also returns the mock.Call object for additional assertions
func SetupTxOnRet(mockTx *MockTx, on string, sqlCmd string, ctx context.Context, extra []any, ret ...any) *mock.Call {
	return mockTx.On(on, ctx, sqlCmd, extra).
		Return(ret...)
}
