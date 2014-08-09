drop table if exists scenes CASCADE;
create table scenes (
    id      serial      primary key  not null
  , name    varchar(64) not null
  , data    text        not null default '{}'
  , owner   int         not null
  , created timestamp   not null default NOW()
  , updated timestamp   not null default now()
);