
--drop function gUser_Session( in sess uuid);
create or replace function rUser_Session
 (
    in  sess        uuid
  , in  secret      varchar
 )
 returns int
 as
 $BODY$
 declare
    rowCount int;
 begin

    delete from sessions where sessionid=sess and secret=secret;
    GET DIAGNOSTICS rowCount = ROW_COUNT;

    return rowCount;
 end;
 $BODY$
 LANGUAGE plpgsql;