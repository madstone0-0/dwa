DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

create table if not exists "user" (
    uid uuid default gen_random_uuid() primary key,
    email varchar(255) unique not null,
    passhash varchar(255) not null,
    isAdmin boolean default false,
    constraint email_format check (
        email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
);

create table if not exists vendor (
    uid uuid default gen_random_uuid() primary key,
    name varchar(255) unique not null,
    logo varchar(255),
    constraint fk_vendor_spec foreign key (uid) references "user"(uid) on
    delete
        cascade
);

create type ACC_TYPE as enum('MOMO', 'BANK');
create table if not exists accounts (
    uid uuid default gen_random_uuid() primary key,
    accountType ACC_TYPE not null,
    bankName varchar(255),
    momoProvider varchar(255),
    constraint fk_vendor_account foreign key (uid) references vendor(uid) on delete cascade
);


create table if not exists buyer (
    uid uuid default gen_random_uuid() primary key,
    name varchar(255) unique not null,
    constraint fk_buyer_spec foreign key (uid) references "user"(uid) on
    delete
        cascade
);

create table if not exists item (
    iid uuid default gen_random_uuid() primary key,
    vid uuid default gen_random_uuid() not null,
    name varchar(255) unique not null,
    pictureUrl varchar(255),
    description varchar(255),
    cost decimal( 12, 2) not null check (cost >= 0),
    constraint fk_item_vendor foreign key (vid) references vendor(uid) on
    delete
        cascade
);

create table if not exists transaction (
    tid uuid default gen_random_uuid() primary key,
    bid uuid default gen_random_uuid() not null,
    vid uuid default gen_random_uuid() not null,
    iid uuid default gen_random_uuid() not null,
    amt decimal(
        12,
        2
    ) not null,
    t_time timestamp default current_timestamp,
    constraint fk_trans_buyer foreign key (bid) references buyer(uid) on
    delete
        cascade,
        constraint fk_trans_vendor foreign key (vid) references vendor(uid) on
        delete
            cascade
);