create table if not exists "user" (
    uid serial primary key,
    email varchar(255) unique not null,
    passhash varchar(255) not null,
    constraint email_format check (
        email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
);

create table if not exists vendor (
    uid serial primary key,
    name varchar(255) unique not null,
    constraint fk_vendor_spec foreign key (uid) references "user"(uid) on
    delete
        cascade
);

create table if not exists buyer (
    uid serial primary key,
    name varchar(255) unique not null,
    constraint fk_buyer_spec foreign key (uid) references "user"(uid) on
    delete
        cascade
);

create table if not exists item (
    iid serial primary key,
    vid serial,
    name varchar(255) not null,
    description varchar(255),
    constraint fk_item_vendor foreign key (vid) references vendor(uid) on
    delete
        cascade
);

create table if not exists transaction (
    tid serial primary key,
    bid serial not null,
    vid serial not null,
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
