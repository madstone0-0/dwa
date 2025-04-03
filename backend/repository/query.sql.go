// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: query.sql

package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const DbVersion = `-- name: DbVersion :one
select version()
`

func (q *Queries) DbVersion(ctx context.Context) (string, error) {
	row := q.db.QueryRow(ctx, DbVersion)
	var version string
	err := row.Scan(&version)
	return version, err
}

const GetBuyerByEmail = `-- name: GetBuyerByEmail :one
select
    "user".uid,
    email,
    name,
    passhash
from
    "user"
inner join buyer on
    "user".uid = buyer.uid
where
    email like $1
limit 1
`

type GetBuyerByEmailRow struct {
	Uid      pgtype.UUID `json:"uid"`
	Email    string      `json:"email"`
	Name     string      `json:"name"`
	Passhash string      `json:"passhash"`
}

func (q *Queries) GetBuyerByEmail(ctx context.Context, email string) (GetBuyerByEmailRow, error) {
	row := q.db.QueryRow(ctx, GetBuyerByEmail, email)
	var i GetBuyerByEmailRow
	err := row.Scan(
		&i.Uid,
		&i.Email,
		&i.Name,
		&i.Passhash,
	)
	return i, err
}

const GetBuyerById = `-- name: GetBuyerById :one
select
    "user".uid,
    email,
    name,
    passhash
from
    "user"
inner join buyer on
    "user".uid = buyer.uid
where
    "user".uid = $1
limit 1
`

type GetBuyerByIdRow struct {
	Uid      pgtype.UUID `json:"uid"`
	Email    string      `json:"email"`
	Name     string      `json:"name"`
	Passhash string      `json:"passhash"`
}

func (q *Queries) GetBuyerById(ctx context.Context, uid pgtype.UUID) (GetBuyerByIdRow, error) {
	row := q.db.QueryRow(ctx, GetBuyerById, uid)
	var i GetBuyerByIdRow
	err := row.Scan(
		&i.Uid,
		&i.Email,
		&i.Name,
		&i.Passhash,
	)
	return i, err
}

const GetItemsByVendorId = `-- name: GetItemsByVendorId :many
select iid, vid, name, pictureurl, description, cost from "item" where vid = $1
`

func (q *Queries) GetItemsByVendorId(ctx context.Context, vid pgtype.UUID) ([]Item, error) {
	rows, err := q.db.Query(ctx, GetItemsByVendorId, vid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Item{}
	for rows.Next() {
		var i Item
		if err := rows.Scan(
			&i.Iid,
			&i.Vid,
			&i.Name,
			&i.Pictureurl,
			&i.Description,
			&i.Cost,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const GetUserByEmail = `-- name: GetUserByEmail :one
select uid, email, passhash, isadmin from "user" where email like $1 limit 1
`

func (q *Queries) GetUserByEmail(ctx context.Context, email string) (User, error) {
	row := q.db.QueryRow(ctx, GetUserByEmail, email)
	var i User
	err := row.Scan(
		&i.Uid,
		&i.Email,
		&i.Passhash,
		&i.Isadmin,
	)
	return i, err
}

const GetUserById = `-- name: GetUserById :one
select uid, email, passhash, isadmin from "user" where uid = $1 limit 1
`

func (q *Queries) GetUserById(ctx context.Context, uid pgtype.UUID) (User, error) {
	row := q.db.QueryRow(ctx, GetUserById, uid)
	var i User
	err := row.Scan(
		&i.Uid,
		&i.Email,
		&i.Passhash,
		&i.Isadmin,
	)
	return i, err
}

const GetVendorByEmail = `-- name: GetVendorByEmail :one
select
    "user".uid,
    email,
    name,
    logo,
    passhash
from
    "user"
inner join vendor on
    "user".uid = vendor.uid
where
    email like $1
limit 1
`

type GetVendorByEmailRow struct {
	Uid      pgtype.UUID `json:"uid"`
	Email    string      `json:"email"`
	Name     string      `json:"name"`
	Logo     *string     `json:"logo"`
	Passhash string      `json:"passhash"`
}

func (q *Queries) GetVendorByEmail(ctx context.Context, email string) (GetVendorByEmailRow, error) {
	row := q.db.QueryRow(ctx, GetVendorByEmail, email)
	var i GetVendorByEmailRow
	err := row.Scan(
		&i.Uid,
		&i.Email,
		&i.Name,
		&i.Logo,
		&i.Passhash,
	)
	return i, err
}

const GetVendorById = `-- name: GetVendorById :one
select
    "user".uid,
    email,
    name,
    logo,
    passhash
from
    "user"
inner join vendor on
    "user".uid = vendor.uid
where
    "user".uid = $1
limit 1
`

type GetVendorByIdRow struct {
	Uid      pgtype.UUID `json:"uid"`
	Email    string      `json:"email"`
	Name     string      `json:"name"`
	Logo     *string     `json:"logo"`
	Passhash string      `json:"passhash"`
}

func (q *Queries) GetVendorById(ctx context.Context, uid pgtype.UUID) (GetVendorByIdRow, error) {
	row := q.db.QueryRow(ctx, GetVendorById, uid)
	var i GetVendorByIdRow
	err := row.Scan(
		&i.Uid,
		&i.Email,
		&i.Name,
		&i.Logo,
		&i.Passhash,
	)
	return i, err
}

const InsertBuyer = `-- name: InsertBuyer :exec
insert into buyer (uid, name) values ($1, $2)
`

type InsertBuyerParams struct {
	Uid  pgtype.UUID `json:"uid"`
	Name string      `json:"name"`
}

func (q *Queries) InsertBuyer(ctx context.Context, arg InsertBuyerParams) error {
	_, err := q.db.Exec(ctx, InsertBuyer, arg.Uid, arg.Name)
	return err
}

const InsertItem = `-- name: InsertItem :one
insert into item (vid, name, pictureurl, description, cost) values ($1, $2, $3, $4, $5) returning iid
`

type InsertItemParams struct {
	Vid         pgtype.UUID    `json:"vid"`
	Name        string         `json:"name"`
	Pictureurl  *string        `json:"pictureurl"`
	Description *string        `json:"description"`
	Cost        pgtype.Numeric `json:"cost"`
}

func (q *Queries) InsertItem(ctx context.Context, arg InsertItemParams) (pgtype.UUID, error) {
	row := q.db.QueryRow(ctx, InsertItem,
		arg.Vid,
		arg.Name,
		arg.Pictureurl,
		arg.Description,
		arg.Cost,
	)
	var iid pgtype.UUID
	err := row.Scan(&iid)
	return iid, err
}

const InsertUser = `-- name: InsertUser :one
insert into "user" (email, passhash) values ($1, $2) returning uid
`

type InsertUserParams struct {
	Email    string `json:"email"`
	Passhash string `json:"passhash"`
}

func (q *Queries) InsertUser(ctx context.Context, arg InsertUserParams) (pgtype.UUID, error) {
	row := q.db.QueryRow(ctx, InsertUser, arg.Email, arg.Passhash)
	var uid pgtype.UUID
	err := row.Scan(&uid)
	return uid, err
}

const InsertVendor = `-- name: InsertVendor :exec
insert into vendor (uid, name) values ($1, $2)
`

type InsertVendorParams struct {
	Uid  pgtype.UUID `json:"uid"`
	Name string      `json:"name"`
}

func (q *Queries) InsertVendor(ctx context.Context, arg InsertVendorParams) error {
	_, err := q.db.Exec(ctx, InsertVendor, arg.Uid, arg.Name)
	return err
}
