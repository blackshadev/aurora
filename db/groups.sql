drop table if exists groups CASCADE;
create table groups (
      id        serial primary key      not null
    , name      varchar(64)             not null
    , lights    varchar(64)
);

insert into groups (
    name, lights
) values ('test', '[1,2]');