package db

import (
	"backend/config"
	"backend/internal/logging"
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

// type IDatabase interface {
// 	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
// 	QueryRow(context.Context, string, ...interface{}) pgx.Row
// 	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
// 	Close()
// }

func NewPool(dbConfig config.Database) (*pgxpool.Pool, func(), error) {
	f := func() {}
	ctx := context.Background()

	consString, err := dbConfig.DSN()

	if err != nil {
		logging.Errorf("Error generating connection string -> %v", err)
		return nil, f, err
	}

	cfg, err := pgxpool.ParseConfig(consString)
	if err != nil {
		logging.Errorf("Error parsing connection string -> %v", err)
		return nil, f, err
	}

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		logging.Errorf("Error creating new pool -> %v", err)
		return nil, f, err
	}

	pingErr := validateDBPool(ctx, pool)
	if pingErr != nil {
		logging.Errorf("Error pinging pool -> %v", err)
		return nil, f, err
	}

	logging.Infof("Created and connected to pool successfully")
	return pool, func() { pool.Close() }, nil

}

func validateDBPool(ctx context.Context, pool *pgxpool.Pool) error {
	err := pool.Ping(ctx)
	if err != nil {
		return errors.New("cannot reach pool")
	}
	return nil
}
