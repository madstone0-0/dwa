package db

import (
	"backend/internal/logging"
	"backend/internal/utils"
	"context"

	"github.com/jackc/pgx/v5"
)

// LogTracer is a custom implementation of the pgx.QueryTracer interface.
// It is used to log the start and end of each SQL query for debugging or monitoring purposes.
type LogTracer struct{}

// TraceQueryStart is called before a query is executed.
// It logs the SQL query with its arguments filled in for better readability.
func (lt LogTracer) TraceQueryStart(ctx context.Context, conn *pgx.Conn, data pgx.TraceQueryStartData) context.Context {
	logging.Infof("Query Start: %v", utils.FillPlaceholders(data.SQL, data.Args))
	return ctx
}

// TraceQueryEnd is called after a query finishes executing.
// It logs information about the completed query.
func (lt LogTracer) TraceQueryEnd(ctx context.Context, conn *pgx.Conn, data pgx.TraceQueryEndData) {
	logging.Infof("Query End: %v", data)
}
