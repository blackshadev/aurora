import psycopg2

class BaseDb(object):
    def __init__(self, host, db, user, pwd=None):
        self.host = host
        self.db = db
        self.user = user
        self.pwd = pwd
    def execResult(self, sql):
        pass
    def execNon(self, sql):
        pass
    def execProc(self, proc, args):
        pass
    def execProcNon(self, proc, args):
        pass


class Psycopg2Db(BaseDb):
    def conn(self):
        connStr =  "host='%s' dbname='%s' user='%s'" % (self.host, self.db, self.user)
        if(self.pwd != None):
            connStr += " password='%s'" % self.pwd
        return psycopg2.connect(dbname=self.db, user=self.user)
    def execResult(self, sql, pars=None):
        conn = self.conn()
        cursor = conn.cursor()
        cursor.execute(sql, pars)
        res = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        cursor.close()
        conn.close()
        return res, columns
    def execNon(self, sql, pars=None):
        conn = self.conn()
        cursor = conn.cursor()
        cursor.execute(sql, pars)
        cursor.close()
        conn.commit()
        conn.close()
    def execProc(self, proc, args):
        conn = self.conn()
        cursor = conn.cursor()
        cursor.callproc(proc, args)
        res = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        cursor.close()
        conn.commit()
        conn.close()
        return res, columns
    def execProcNon(self, proc, args):
        conn = self.conn()
        cursor = conn.cursor()
        cursor.callproc(proc, args)
        cursor.close()
        conn.commit()
        conn.close()