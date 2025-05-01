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

-- name: UpdateBuyer :exec
with updated_user as (
    update "user"
    set 
    email = $2
    where "user".uid = $3
    returning uid
)
update buyer
set
name = $1
where uid in (select uid from updated_user);


-- name: GetAllItems :many
select * from "item";

-- name: GetItemsByVendorId :many
select * from "item" where vid = $1;

-- name: GetItemByName :one
select * from item where name like $1;

-- name: GetItemById :one
select * from item where iid = $1;

-- name: GetItemByIdWithVendorInfo :one
select
    iid,
    vid,
    i."name" as name,
    pictureurl,
    description,
    "category",
    quantity,
    cost,
    v."name" as vendor_name,
    v.logo as vendor_logo,
    u.email as vendor_email
from
    item i
join vendor v on
    v.uid = i.vid
join "user" u on
    u.uid = v.uid
where
    iid = $1;

-- name: InsertVendor :exec
insert into vendor (uid, name) values ($1, $2);

-- name: DeleteUser :exec
delete from "user" where uid = $1;

-- name: UpdateVendor :exec
with updated_user as (
    update "user"
    set 
    email = $3
    where "user".uid = $4
    returning uid
)
update vendor
set
name = $1,
logo = $2
where uid in (select uid from updated_user);

-- name: InsertItem :one
insert into item (vid, name, pictureurl, description, category, quantity, cost) values ($1, $2, $3, $4, $5, $6, $7) returning iid;

-- name: UpdateItem :exec
update item set name = $1,  description = $2, cost = $3, pictureurl = $4, category = $5, quantity = $6 
where iid = $7
and vid = $8;

-- name: DeleteItem :exec
delete from item where iid = $1;

-- name: CreateTransaction :one
insert into transaction (bid, vid, iid, amt, qty_bought, t_time) values($1, $2, $3, $4, $5, now()) returning tid;

-- name: GetTransactionsForVendor :many
select item.name, amt, t_time from transaction 
left join item on item.iid = transaction.iid
where transaction.vid = $1 
order by t_time desc;


-- name: GetTotalSales :one
select coalesce(sum(amt)::decimal(12, 2), 0) from transaction
where vid = $1;

-- name: GetTotalSalesForItem :one
select coalesce(sum(amt)::decimal(12, 2), 0) from transaction
where vid = $1 and iid = $2;

-- name: ReduceQuantityOfItem :exec
update item set quantity = quantity - $3
where iid = $1
and vid = $2;

-- name: GetCartItemsForBuyer :many
select
    vendor.name as vendor_name,
    item.name,
    item.cost,
    item.pictureurl,
    cart.quantity,
    cart.added_time,
    item.iid,
    item.vid 
from
    cart
left join vendor on
    vendor.uid = cart.vid
left join item on
    item.iid = cart.iid
where
    cart.bid = $1
order by
    added_time desc;

-- name: AddToCart :exec
insert into cart (bid, iid, vid, quantity) values($1, $2, $3, $4);

-- name: GetCartItem :one
select bid, iid, vid from cart
where bid = $1 and iid = $2 and vid = $3;

-- name: DeleteCartItem :exec
delete from cart where bid = $1 and iid = $2 and vid = $3;

-- name: UpdateQuantityOfCartItem :exec
update cart set quantity = $4
where bid = $1 and iid = $2 and vid = $3;

-- name: ClearCart :exec
delete from cart where bid = $1;
