import httplib
import time
import json as Json
import ConfigParser
import time
from lights import *
from LittleDev.UniversalRequest import UniversalRequests

"""
LogLevel:
0: minor notice (message)
1: Notice
2: Warning
3: Error 
4: Fatal
5: None
"""

class Hue(object):
    __dict__ = ["ip","logLevel","sender","uid","configFile", "config", "isLinked"]
    def __init__(self, ip="0.0.0.0", logLevel=0, config=None):
        super(Hue, self).__init__()
        self.ip = ip
        self.sender = CloseSender(ip)
        self.logLevel = logLevel
        self.uid = None
        self.isLinked = False

        if(config != None):
            self.setConfig(config)
    def setConfig(self, config):
        self.config = config

        self.uid = self.config.get("username")
        print "found uid %s" % self.uid
    def url(self):
        return "/api/" + self.uid + "/"
    def __send(self, method="GET", url="/", body=""):
        self.log("sending to hue on %s (%s): %s" % (url, method, body), 0)
        body, status, headers = self.sender.request(body=body, \
            method=method, url=url)
        return Json.loads(body)
    def start(self):
        self.log("Connecting to hue on %s with %s" % (self.ip, self.uid), 1)
        resp = self.__send('GET', '/api/%s' % self.uid)

        if("lights" not in resp and len(resp) > 0 and "error" not in resp[0]):
            self.uid = resp[0]["success"]["username"]
            self.isLinked = True
            return True
        elif("lights" not in resp and "error" in resp[0] \
            and (resp[0]["error"]["type"] in [1, 101, 7] ) ):
            self.isLinked = self.link()
        else:
            self.isLinked = True
    def link(self):
        self.log("Trying to link to Hue", 1)
        print "Please Press the link button"
        
        for x in range(0, 10):
            resp = self.__send('POST', '/api', \
                '{"devicetype": "Aurora" }')
            if(len(resp) > 0 and "error" not in resp[0]):
                print resp
                self.uid = resp[0]["success"]["username"]
                self.config.set("username", self.uid)
                print  "got uid %s" % self.uid
                self.config.save()
                return True
            else:
                print resp
                print "retry authentication in 5 secs"
                time.sleep(5)
        return False
    def getAllData(self):
        return self.__send("GET", "/api/%s" % self.uid);
    def universalRequest(self, json):
        req = UniversalRequests(self, json)
        req.sendAll()
    def getLights(self, addRgb = False):
        lights = LightList(self)

        if(addRgb):
            lights.addRGB()
            
        return lights.toList()
    def getGroups(self, addRgb):
        groups = GroupList(self)

        if(addRgb):
            groups.addRGB()

        return groups.toList()
    def actionGroup(self, gId, action):
        resp = self.__send('PUT', '/api/%s/groups/%s/action' % (self.uid, gId), Json.dumps(action))
        print resp
        return resp
    def getSettings(self):
        return self.__send('GET', '/api/%s/config' % self.uid)
    def setSettings(self, data):
        print data
        res = self.__send('PUT', '/api/%s/config' % self.uid, \
            Json.dumps(data))
        print res
        return res
    def getLight(self, lId):
        return self.__send('GET', '/api/%s/lights/%s' % (self.uid, lId))
    def setLightState(self, lId, obj):
        res = self.__send('PUT', '/api/%s/lights/%s/state' % (self.uid, lId), \
            Json.dumps(obj))
        return res
    def setLightName(self, lId, obj):
        return self.__send('PUT', '/api/%s/lights/%s' % (self.uid, lId), \
            Json.dumps(obj))
    def getRGB(self, light):
        mode = light["state"]["colormode"]
        convertor = Convertor(mode)
        r, g, b = convertor.toRGB(light["state"])
        return '#{:02x}{:02x}{:02x}'.format(r, g, b)
    def close(self):
        self.log("Closing", 1)
        self.sender.close()
        UniversalRequests.pool.join()
    def log(self, msg, level, tag="Hue"):
        if level >= self.logLevel:
            print "%s [%s]: %s" % (time.strftime("%Y-%m-%d %H:%M:%S") , tag, msg)

class Sender(object):
    def __init__(self, dest):
        self.dest = dest
    @staticmethod
    def parseRequest(conn):
        resp = conn.getresponse()
        return resp.read(), (resp.status, resp.reason), resp.getheaders()

class CloseSender(Sender):
    def __init__(self, dest):
        super(CloseSender, self).__init__(dest)
    def request(self, body="", method="GET", url="/"):
        conn = httplib.HTTPConnection(self.dest)
        conn.connect()
        conn.request(method, url, body)
        resp = Sender.parseRequest(conn)
        conn.close()
        return resp
    def close(self):
        pass
        
class OpenSender(Sender):
    def __init__(self, dest):
        super(OpenSender, self).__init__(dest)
        self.dest = dest
        self.conn = httplib.HTTPConnection(self.dest)
        self.conn.connect()
    def request(self, body="", method="GET", url="/"):
        self.conn.request(method, url, body)
        return Sender.parseRequest(self.conn)
    def close(self):
        self.conn.close()






