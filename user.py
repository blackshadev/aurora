import psycopg2
import hashlib
from flask import session, redirect, url_for, Flask, Blueprint, render_template, Response, request
import json as Json
import hmac
import copy

class Users:
    db = "aurora"
    user = "aurora"
    @staticmethod
    def auth(username, pwd):
        conn = psycopg2.connect(database=Users.db, user=Users.user)
        cur = conn.cursor()
        passhash = hashlib.sha256(pwd).hexdigest()
        
        cur.callproc("authUser", [username, passhash])
        res = cur.fetchone()
        cur.close()
        conn.commit()
        conn.close()

        user = User()
        user.fromRecord(res)

        return user
    @staticmethod
    def getRecord(session):
        conn = psycopg2.connect(database=Users.db, user=Users.user)
        cur = conn.cursor()
        cur.callproc("gUser_Session", [session])
        res = cur.fetchone()
        cur.close()
        conn.commit()
        conn.close()
        return res
    @staticmethod
    def getUser(sessid):
        return User(sessid)
    @staticmethod
    def isLogged(sessid):
        user = Users.getRecord(sessid)
        return user != None and user[0] != None
    @staticmethod
    def logout(sessid, secret):
        print "loging out: %s, %s" % (sessid, secret)
        conn = psycopg2.connect(database=Users.db, user=Users.user)
        cur = conn.cursor()
        cur.callproc("rUser_Session", [sessid, secret])
        cur.close()
        conn.commit()
        conn.close()
    @staticmethod
    def validateRequest(json):
        if "sessid" not in json or "signature" not in json:
            print "No sess found in (%s)", str(json)
            return (False, None)

        sessid = json["sessid"]
        user = User(sessid)

        return (user.isValid and user.validateData(json), user)

class User:
    __dict__ = ["sessid", "username", "name", "secret", "isValid"]
    def __init__(self, session=None):
        self.isValid = False
        self.username = ""
        self.sessid = None
        self.name = ""
        self.secret = ""

        if(type(session) is str or type(session) is unicode):
            self.sessid = session

        if self.sessid == None and session != None and "sessid" in session:
            self.sessid = session['sessid']
        
        rec = None
        if(self.sessid != None):
            rec = Users.getRecord(self.sessid)

        self.fromRecord(rec)

    def fromRecord(self, rec):
        self.isValid = rec != None and len(rec) > 5
        if(self.isValid):
            self.uid = rec[0]
            self.username = rec[1]
            self.name = rec[3]
            self.settings = rec[4]
            self.colors = rec[5]
            self.sessid = rec[6]
            self.secret = rec[7]
    def validateData(self, data):
        if "signature" not in data or "data" not in data:
            return False
        given_sign = data["signature"]

        sign = hmac.new(self.secret)
        sign.update(data["data"])
        calce = sign.hexdigest()
        valid = str(given_sign) == str(calce)
        if not valid:
            print "signed: %s" % Json.dumps(data["data"], separators=(',', ':'))
            print "secret: %s" % self.secret
            print "given: %s, %s" % (given_sign, type(given_sign))
            print "calce: %s, %s" % (calce, type(calce))
        return valid
    def setColors(self, colors):
        sColors = Json.dumps(colors, separators=(',', ':'))
        conn = psycopg2.connect(database=Users.db, user=Users.user)
        cur = conn.cursor()
        cur.execute("update users set colors=%s where 1=1 and id=%s", (sColors, self.uid))
        cur.close()
        conn.commit()
        conn.close()
    def __str__(self):
        return "[%s][%s]: (%s, %s, %s)" % (self.username, self.name,
            self.sessid, self.secret, str(self.isValid))