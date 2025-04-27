package testing

import (
	"context"
	"testing"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stretchr/testify/mock"
)

// Mocker defines the minimal interface for setting up expectations.
type Mocker interface {
	On(methodName string, arguments ...any) *mock.Call
}

// SetupMock configures a method call on the provided mock object.
// If args is non-empty, it passes them to On; otherwise it calls On without arguments.
func SetupMock(mock Mocker, on string, args []any, ret ...any) *mock.Call {
	if len(args) != 0 {
		return mock.On(on, args...).Return(ret...)
	}
	return mock.On(on).Return(ret...)
}

// SetupScanWithUUID sets up the mock row to scan a UUID value into the destination
func SetupScanWithUUID(mockRow *MockRow, uid pgtype.UUID) *mock.Call {
	return SetupMock(mockRow, "Scan", []any{mock.Anything}, nil).Run(func(args mock.Arguments) {
		if dest, ok := args.Get(0).(*pgtype.UUID); ok {
			*dest = uid
		}
	})
}

// SetupScanReturnArgs sets up the mock row to return a specific value when scanning with additional arguments
// also returns the mock.Call object for additional assertions
func SetupScanReturnArgs(mockRow *MockRow, ret any, args ...any) *mock.Call {
	return SetupMock(mockRow, "Scan", args, ret)
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
	return SetupMock(mockPool, "QueryRow", []any{ctx, sqlCmd, extra}, mockRow)
}

// SetupPoolOnRet sets up the mock pool to return a specific value when the on method is called
// also returns the mock.Call object for additional assertions
func SetupPoolOnRet(mockPool *MockPool, on string, sqlCmd string, ctx context.Context, extra []any, ret ...any) *mock.Call {
	return SetupMock(mockPool, on, []any{ctx, sqlCmd, extra}, ret...)
}

// SetupTxQueryRow sets up the mock transaction to return a mock row when the query is executed
// also returns the mock.Call object for additional assertions
func SetupTxQueryRow(mockTx *MockTx, mockRow *MockRow, sqlCmd string, ctx context.Context, extra []any) *mock.Call {
	return SetupMock(mockTx, "QueryRow", []any{ctx, sqlCmd, extra}, mockRow)
}

// SetupTxOnRet sets up the mock transaction to return a specific value when the on method is called
// also returns the mock.Call object for additional assertions
func SetupTxOnRet(mockTx *MockTx, on string, sqlCmd string, ctx context.Context, extra []any, ret ...any) *mock.Call {
	return SetupMock(mockTx, on, []any{ctx, sqlCmd, extra}, ret...)
}

// vendorScanExists is a helper function to setup a mock row that confirms a vendor exists on scan
func VendorScanExists(mockRow *MockRow) {
	SetupScanReturnArgs(mockRow, nil, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

// itemScanExists is a helper function to setup a mock row that confirms an item exists on scan
func ItemScanExists(mockRow *MockRow) {
	SetupScanReturnArgs(mockRow, nil, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

// vendorScanNotExists  is a helper function to setup a mock row that confirms a vendor does exists on scan returning an
// appropriate error
func VendorScanNotExists(mockRow *MockRow, err error) {
	SetupScanReturnArgs(mockRow, err, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

// itemScanNotExists is a helper function to setup a mock row that confirms an item does exists on scan returning an
// appropriate error
func ItemScanNotExists(mockRow *MockRow, err error) {
	SetupScanReturnArgs(mockRow, err, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

// printError is a helper function to print out unexpected errors
func PrintError(err error, t *testing.T) {
	if err != nil {
		t.Logf("Error: %v", err)
	}
}
