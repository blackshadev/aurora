import httplib
from LittleDev.Pool import ThreadPool
import json as Json

def send(o):
    o = o[0]
    conn = httplib.HTTPConnection(o["dest"])
    conn.connect()
    print o["dest"], o["url"]
    conn.request(o["method"], o["url"], o["data"])
    resp = conn.getresponse()
    print resp.read()
    conn.close()

# todo close pool properly
class UniversalRequests:
    urlMapping = { "lights": "lights/%s/state"}
    pool = ThreadPool(8)
    def __init__(self, hue, json):
        self.hue = hue

        # containing the urls to send the body to
        self.requests = []
        # will contain all future objects from the threadpool
        self.futures = []

        self.body = Json.dumps(json["body"])

        if "lights" in json:
            for i in range(0, len(json["lights"])):
                o = json["lights"][i]
                self.addRequest("lights", json["lights"][i])
    def addRequest(self, t, lId):
        req = {
            "dest": self.hue.ip,
            "url": self.hue.url() + self.urlMapping[t] % lId,
            "data": self.body,
            "method": "PUT"
        }
        self.requests.append(req)
    def sendAll(self):
        for o in self.requests:
            self.pool.submit(send, [o])