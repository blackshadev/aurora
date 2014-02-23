drop table if exists userColors CASCADE;
create table userColors (
    id          serial primary key  not null
  , uid         int                 not null
  , descr       varchar(128)
  , color       varchar(64)
);