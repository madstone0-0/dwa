package db

import (
	"backend/internal/logging"
	"backend/internal/utils"
	"context"

	"github.com/jackc/pgx/v5"
)

type LogTracer struct{}

func (lt LogTracer) TraceQueryStart(ctx context.Context, conn *pgx.Conn, data pgx.TraceQueryStartData) context.Context {
	logging.Infof("Query Start: %v", utils.FillPlaceholders(data.SQL, data.Args))
	return ctx
}

func (lt LogTracer) TraceQueryEnd(ctx context.Context, conn *pgx.Conn, data pgx.TraceQueryEndData) {
	logging.Infof("Query End: %v", data)
}
