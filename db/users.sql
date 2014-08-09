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
    '9aebe161a1c31642e296d175fc8db18586edddf85f2371d19fa35de887cb45cd', 
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
