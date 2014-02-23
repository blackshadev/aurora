import json as Json
from hue.hue import Hue
from hue.huebeat import HueBeat
from config import Config
import signal
import time
from hue.huesocket import WebSocketServer, WebSocketHandler

config  = Config("hue.cfg")
hue = Hue("192.168.2.13")

hue.setConfig(config.section("hue"))
hb = HueBeat(hue)
hb.deamon = True

WebSocketHandler.event = hb.onDataChanged
wss = WebSocketServer('', 4242)
wss.deamon = True

def onclose(sigint, something):
    print "stopping";
    wss.stop()
    hb.stop()
    hb.join()
    wss.join()
    config.save()

signal.signal(signal.SIGINT, onclose)

hb.start()
wss.start()

while(hb.running):
    hb.onDataChanged.wait(1)
    if not hb.onDataChanged.is_set():
        continue

    print "DATACHANGED"

    for conn in WebSocketHandler.connections:
        conn.sendMessage("Dude something changed")

    hb.onDataChanged.clear()


# lights = hue.getLights(True)
# print lights
# print hue.getRGB(lights[0][1])






