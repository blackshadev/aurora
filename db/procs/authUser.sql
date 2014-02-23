drop function authUser
 (
    in  _username    varchar(64)
  , in  _passHash    varchar(256)
 );
create or replace function authUser
 (
    in  _username    varchar(64)
  , in  _passHash    varchar(256)
 )
 returns setof user_rec
 as
 $BODY$
 declare
    _uid     int;
    _sessid  uuid;
 begin

    select usr.id into _uid
    from users usr
    where 1=1 
      and usr.username = _username
      and usr.password = _passHash;

    if _uid is null then
        return;
    end if;

    select uuid_generate_v1() into _sessid;

    insert into sessions (uid, sessionid)
     values ( _uid,  _sessid);
    perform renew_secret(_sessid); 

    return query select * from gUser_Session(_sessid);
 end;
 $BODY$
 LANGUAGE plpgsql;