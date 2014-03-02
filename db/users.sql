drop table if exists users CASCADE;
create table users (
    id          serial primary key      not null
  , username    varchar(64)             not null
  , password    varchar(256)            not null
  , name        varchar(64)
  , settings    text
  , colors      text
);

insert into users (username, password, name, settings, colors) values (
    'admin', 
    '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 
    'Vincent', 
    '{}', 
    '{}'
);


drop table if exists sessions CASCADE;
create table sessions (
    sessionid   uuid primary key    not null
  , uid         int                 not null
  , secret      varchar(64)
  , inserted    timestamp           not null    default now()
  , updated     timestamp           not null    default now()
);
