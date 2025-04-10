package testing

import (
	"backend/repository"
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stretchr/testify/mock"
)

// MockQueries is a mock implementation of the repository.Queries interface
type MockQueries struct {
	mock.Mock
}

// MockPool is a mock implementation of the db.Pool interface
type MockPool struct {
	mock.Mock
}

// MockTx is a mock implementation of the pgx.Tx interface
type MockTx struct {
	mock.Mock
}

// MockRow is a mock implementation of the pgx.Row interface
type MockRow struct {
	mock.Mock
}

func (m *MockQueries) GetUserByEmail(ctx context.Context, email string) (repository.User, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(repository.User), args.Error(1)
}

func (m *MockQueries) GetUserById(ctx context.Context, uid pgtype.UUID) (repository.User, error) {
	args := m.Called(ctx, uid)
	return args.Get(0).(repository.User), args.Error(1)
}

func (m *MockQueries) GetBuyerByEmail(ctx context.Context, email string) (repository.GetBuyerByEmailRow, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(repository.GetBuyerByEmailRow), args.Error(1)
}

func (m *MockQueries) GetVendorByEmail(ctx context.Context, email string) (repository.GetVendorByEmailRow, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(repository.GetVendorByEmailRow), args.Error(1)
}

func (m *MockQueries) InsertUser(ctx context.Context, arg repository.InsertUserParams) (pgtype.UUID, error) {
	args := m.Called(ctx, arg)
	return args.Get(0).(pgtype.UUID), args.Error(1)
}

func (m *MockQueries) InsertBuyer(ctx context.Context, arg repository.InsertBuyerParams) error {
	args := m.Called(ctx, arg)
	return args.Error(0)
}

func (m *MockQueries) InsertVendor(ctx context.Context, arg repository.InsertVendorParams) error {
	args := m.Called(ctx, arg)
	return args.Error(0)
}

func (m *MockQueries) WithTx(tx pgx.Tx) *repository.Queries {
	args := m.Called(tx)
	return args.Get(0).(*repository.Queries)
}

func (m *MockPool) Begin(ctx context.Context) (pgx.Tx, error) {
	args := m.Called(ctx)
	return args.Get(0).(pgx.Tx), args.Error(1)
}

func (m *MockPool) Exec(ctx context.Context, cmd string, extra ...any) (pgconn.CommandTag, error) {
	args := m.Called(ctx, cmd, extra)
	return args.Get(0).(pgconn.CommandTag), args.Error(1)
}

func (m *MockPool) Query(ctx context.Context, cmd string, extra ...any) (pgx.Rows, error) {
	args := m.Called(ctx, cmd, extra)
	return args.Get(0).(pgx.Rows), args.Error(1)
}

func (m *MockPool) QueryRow(ctx context.Context, cmd string, extra ...any) pgx.Row {
	args := m.Called(ctx, cmd, extra)
	return args.Get(0).(pgx.Row)
}

func (m *MockTx) Begin(ctx context.Context) (pgx.Tx, error) {
	args := m.Called(ctx)
	return args.Get(0).(pgx.Tx), args.Error(1)
}

func (m *MockTx) Commit(ctx context.Context) error {
	args := m.Called(ctx)
	return args.Error(0)
}

func (m *MockTx) Rollback(ctx context.Context) error {
	args := m.Called(ctx)
	return args.Error(0)
}

func (m *MockTx) Conn() *pgx.Conn {
	args := m.Called()
	return args.Get(0).(*pgx.Conn)
}

func (m *MockTx) CopyFrom(ctx context.Context, tableName pgx.Identifier, columnNames []string, rowSrc pgx.CopyFromSource) (int64, error) {
	args := m.Called(ctx, tableName, columnNames, rowSrc)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockTx) SendBatch(ctx context.Context, b *pgx.Batch) pgx.BatchResults {
	args := m.Called(ctx, b)
	return args.Get(0).(pgx.BatchResults)
}

func (m *MockTx) LargeObjects() pgx.LargeObjects {
	args := m.Called()
	return args.Get(0).(pgx.LargeObjects)
}

func (m *MockTx) Prepare(ctx context.Context, name, sql string) (*pgconn.StatementDescription, error) {
	args := m.Called(ctx, name, sql)
	return args.Get(0).(*pgconn.StatementDescription), args.Error(1)
}

func (m *MockTx) Exec(ctx context.Context, sql string, arguments ...any) (commandTag pgconn.CommandTag, err error) {
	args := m.Called(ctx, sql, arguments)
	return args.Get(0).(pgconn.CommandTag), args.Error(1)
}

func (m *MockTx) Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error) {
	Args := m.Called(ctx, sql, args)
	return Args.Get(0).(pgx.Rows), Args.Error(1)
}

func (m *MockTx) QueryRow(ctx context.Context, sql string, args ...any) pgx.Row {
	Args := m.Called(ctx, sql, args)
	return Args.Get(0).(pgx.Row)
}

func (m *MockPool) Close() {
	m.Called()
}

func (m *MockRow) Scan(dest ...any) error {
	args := m.Called(dest...)
	return args.Error(0)
}

func (m *MockRow) Close() {
	m.Called()
}

func (m *MockRows) Close() {
	m.Called()
}

func (m *MockRows) Err() error {
	args := m.Called()
	return args.Error(0)
}

func (m *MockRows) CommandTag() pgconn.CommandTag {
	args := m.Called()
	return args.Get(0).(pgconn.CommandTag)
}

func (m *MockRows) Next() bool {
	args := m.Called()
	return args.Bool(0)
}

func (m *MockRows) Scan(dest ...any) error {
	args := m.Called(dest...)
	return args.Error(0)
}

func (m *MockRows) Values() ([]any, error) {
	args := m.Called()
	return args.Get(0).([]any), args.Error(1)
}

func (m *MockRows) RawValues() [][]byte {
	args := m.Called()
	return args.Get(0).([][]byte)
}

func (m *MockRows) Conn() *pgx.Conn {
	args := m.Called()
	return args.Get(0).(*pgx.Conn)
}

func (m *MockRows) FieldDescriptions() []pgconn.FieldDescription {
	args := m.Called()
	return args.Get(0).([]pgconn.FieldDescription)
}
