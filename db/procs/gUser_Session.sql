--drop type user_rec cascade;
create or replace TYPE user_rec as 
(user_id integer,
 user_name varchar,
 passhash varchar,
 name varchar,
 sessid uuid,
 secret varchar
 );

--drop function gUser_Session( in sess uuid);
create or replace function gUser_Session
 (
    in  sess        uuid
 )
 returns setof user_rec
 as
 $BODY$
 begin
    return query select usr.*, ses.sessionid, ses.secret
    from users usr
      left join sessions ses on ses.uid = usr.id
    where 1=1 
      and ses.sessionid = sess;
 end;
 $BODY$
 LANGUAGE plpgsql;