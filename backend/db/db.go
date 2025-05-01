package db

// This file is responsible for creating a connection pool to the database and pinging it to check if it's alive.

import (
	"backend/config"
	"backend/internal/logging"
	"backend/internal/utils"
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool is an interface to abstract the database pool functionalities.
// This helps with mocking during unit tests and decouples implementation from usage.
type Pool interface {
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error) // For executing commands like INSERT, UPDATE, DELETE
	Query(context.Context, string, ...any) (pgx.Rows, error)         // For executing SELECT queries that return multiple rows
	QueryRow(context.Context, string, ...any) pgx.Row                // For SELECT queries expected to return a single row
	Begin(context.Context) (pgx.Tx, error)                           // For starting a database transaction
	Close()                                                          // For closing the database connection pool
}

// tracer is used to trace and log database queries when enabled (e.g., in debug mode).
var tracer pgx.QueryTracer = LogTracer{}

// NewPool creates a new database connection pool using the provided context and database configuration.
// It returns the Pool interface, a close function to release resources, and an error if something goes wrong.
func NewPool(ctx context.Context, dbConfig config.Database) (Pool, func(), error) {
	// f is a no-op fallback close function
	f := func() {}

	// Generate the DSN (Data Source Name) from the config
	consString, err := dbConfig.DSN()
	if err != nil {
		logging.Errorf("Error generating connection string -> %v", err)
		return nil, f, err
	}

	// Parse the connection string into a pgxpool.Config
	cfg, err := pgxpool.ParseConfig(consString)
	if err != nil {
		logging.Errorf("Error parsing connection string -> %v", err)
		return nil, f, err
	}

	// Attach the tracer if the application is running in debug mode
	if (utils.DefaultEnv{}.Env("GIN_MODE") == "debug") {
		cfg.ConnConfig.Tracer = tracer
	}

	// Log the configuration string being used to connect
	logging.Infof("Config -> %v", cfg.ConnString())

	// Create the actual connection pool
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		logging.Errorf("Error creating new pool -> %v", err)
		return nil, f, err
	}

	// Check if the pool is valid and reachable
	pingErr := validateDBPool(ctx, pool)
	if pingErr != nil {
		logging.Errorf("Error pinging pool -> %v", err)
		return nil, f, pingErr
	}

	// Log success and return the pool and a close function
	logging.Infof("Created and connected to pool successfully")
	return pool, func() { pool.Close() }, nil
}

// validateDBPool checks if the pool can be pinged (i.e., if the database is reachable).
func validateDBPool(ctx context.Context, pool *pgxpool.Pool) error {
	err := pool.Ping(ctx)
	if err != nil {
		return errors.New("cannot reach pool")
	}
	return nil
}
