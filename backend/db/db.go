package db

import (
	"backend/config"
	"backend/internal/logging"
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Pool interface {
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
	Query(context.Context, string, ...any) (pgx.Rows, error)
	QueryRow(context.Context, string, ...any) pgx.Row
	Begin(context.Context) (pgx.Tx, error)
	Close()
}

func NewPool(ctx context.Context, dbConfig config.Database) (Pool, func(), error) {
	f := func() {}

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

	logging.Infof("Config -> %v", cfg.ConnString())

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		logging.Errorf("Error creating new pool -> %v", err)
		return nil, f, err
	}

	pingErr := validateDBPool(ctx, pool)
	if pingErr != nil {
		logging.Errorf("Error pinging pool -> %v", err)
		return nil, f, pingErr
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
