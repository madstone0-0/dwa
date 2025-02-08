-- name: GetUserByEmail :one
select * from "user" where email like $1 limit 1;

-- name: GetUserById :one
select * from "user" where uid = $1 limit 1;

-- name: GetBuyerByEmail :one
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
limit 1;

-- name: GetBuyerById :one
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
limit 1;

-- name: GetVendorByEmail :one
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
limit 1;

-- name: GetVendorById :one
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
limit 1;

-- name: DbVersion :one
select version();

-- name: InsertUser :one
insert into "user" (email, passhash) values ($1, $2) returning uid;

-- name: InsertBuyer :exec
insert into buyer (uid, name) values ($1, $2);
