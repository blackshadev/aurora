--drop function gUser_Session( in sess uuid);
create or replace function renew_secret
 (
    in  sess        uuid
 )
 returns varchar
 as
 $BODY$
 declare
    secretStr varchar(32);
 begin
    secretStr = random_string(32);

    update sessions ses 
      set secret=secretStr
      where 1=1
       and ses.sessionid = sess;

    return secretStr;
 end;
 $BODY$
 LANGUAGE plpgsql;