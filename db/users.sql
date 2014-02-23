drop table if exists users CASCADE;
create table users (
    id          serial primary key      not null
  , username    varchar(64)             not null
  , password    varchar(256)            not null
  , name        varchar(64)
);

drop table if exists sessions CASCADE;
create table sessions (
    sessionid   uuid primary key    not null
  , uid         int                 not null
  , secret      varchar(64)
  , inserted    timestamp           not null    default now()
  , updated     timestamp           not null    default now()
);
