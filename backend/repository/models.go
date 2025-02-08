// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0

package repository

import (
	"github.com/jackc/pgx/v5/pgtype"
)

type Buyer struct {
	Uid  int32
	Name string
}

type Item struct {
	Iid         int32
	Vid         pgtype.Int4
	Name        string
	Description pgtype.Text
}

type Transaction struct {
	Tid   int32
	Bid   int32
	Vid   int32
	Amt   pgtype.Numeric
	TTime pgtype.Timestamp
}

type User struct {
	Uid      int32
	Email    string
	Passhash string
}

type Vendor struct {
	Uid  int32
	Name string
}
