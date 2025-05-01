-- The database schema for Ashesi Dwa
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- The table for the users of the system
-- This table is used to store the users of the system. The uid is a unique identifier for each user.
create table if not exists "user" (
    uid uuid default gen_random_uuid() primary key,
    email varchar(255) unique not null,
    passhash varchar(255) not null,
    isAdmin boolean default false,
    constraint email_format check (
        email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
);

-- The table for the vendors of the system
-- This table is used to store the vendors of the system. The uid is a foreign key that references the user table.
create table if not exists vendor (
    uid uuid default gen_random_uuid() primary key,
    name varchar(255) unique not null,
    logo varchar(255),
    constraint fk_vendor_spec foreign key (uid) references "user"(uid) on
    delete
        cascade
);

-- The table for accounts
-- This table is used to store the accounts of the vendors. The uid is a foreign key that references the vendor table.
create type ACC_TYPE as enum('MOMO', 'BANK');
create table if not exists accounts (
    uid uuid default gen_random_uuid() primary key,
    accountType ACC_TYPE not null,
    bankName varchar(255),
    momoProvider varchar(255),
    constraint fk_vendor_account foreign key (uid) references vendor(uid) on delete cascade
);

-- The table for the buyers of the system
-- This table is used to store the buyers of the system. The uid is a foreign key that references the user table.
create table if not exists buyer (
    uid uuid default gen_random_uuid() primary key,
    name varchar(255) unique not null,
    constraint fk_buyer_spec foreign key (uid) references "user"(uid) on
    delete
        cascade
);

-- The table for the category of items
-- This table is used to store the categories of items. The uid is a foreign key that references the user table.
create type CATEGORY as enum('FASHION', 'ELECTRONICS', 'SERVICES', 'BOOKS_SUPPLIES');
create table if not exists item (
    iid uuid default gen_random_uuid() primary key,
    vid uuid default gen_random_uuid() not null,
    name varchar(255) unique not null,
    pictureUrl varchar(255),
    description varchar(255),
    category CATEGORY not null,
    quantity integer default 1 not null check (quantity >= 0),
    cost decimal( 12, 2) not null check (cost >= 0),
    constraint fk_item_vendor foreign key (vid) references vendor(uid) on
    delete
        cascade
);

-- The table for the transactions of the system
-- This table is used to store the transactions of the system. The uid is a foreign key that references the user table.
create table if not exists transaction (
    tid uuid default gen_random_uuid() primary key,
    bid uuid default gen_random_uuid() not null,
    vid uuid default gen_random_uuid() not null,
    iid uuid default gen_random_uuid() not null,
    amt decimal(
        12,
        2
    ) not null,
    qty_bought integer not null check(qty_bought > 0),
    t_time timestamp default current_timestamp,
    constraint fk_trans_buyer foreign key (bid) references buyer(uid) on
    delete
        cascade,
        constraint fk_trans_vendor foreign key (vid) references vendor(uid) on
        delete
            cascade
);

-- The table for the cart of the system
-- This table is used to store the items in the cart of the buyer. The uid is a foreign key that references the user table.
create table if not exists cart (
    bid uuid default gen_random_uuid() not null, 
    iid uuid default gen_random_uuid() not null,
    vid uuid default gen_random_uuid() not null,
    quantity integer not null check(quantity > 0),
    added_time timestamp default current_timestamp,
    constraint fk_cart_buyer foreign key (bid) references buyer(uid) on 
    delete cascade,
    constraint fk_cart_item foreign key (iid) references item(iid) on
    delete cascade,
    constraint fk_cart_item_vendor foreign key(vid) references vendor(uid)
    on delete cascade
);
