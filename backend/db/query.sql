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

-- name: GetItemsByVendorId :many
select * from "item" where vid = $1;

-- name: GetItemByName :one
select * from item where name like $1;

-- name: GetItemById :one
select * from item where iid = $1;

-- name: InsertVendor :exec
insert into vendor (uid, name) values ($1, $2);

-- name: InsertItem :one
insert into item (vid, name, pictureurl, description, cost) values ($1, $2, $3, $4, $5) returning iid;

-- name: UpdateItem :exec
update item set name = $1,  description = $2, cost = $3, pictureurl = $4 where iid = $5 and vid = $6;

