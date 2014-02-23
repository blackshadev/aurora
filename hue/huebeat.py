import threading
import time

class HueBeat(threading.Thread):
    __dict__ = ["hue", "thread","running","data","onDataChanged"]

    """ Maintains connection to the hue and updates the data"""
    def __init__(self, hue):
        super(HueBeat, self).__init__()
        self.hue = hue
        self.running = True
        self.data = { "lights":[], "groups":[], "settings": {} }
        self.onDataChanged = threading.Event()
    def run(self):
        if not self.hue.isLinked:
            self.hue.start()

        while(self.running):
            lightsChanged = False
            #print "HueBeat: updating"

            lights = self.hue._getLights(True, True)
            if(lights != self.data["lights"]):
                print "Lights changed"
                lightsChanged = True
                self.data["lights"] = lights

            if(lightsChanged):
                self.dataChanged()

            time.sleep(1)
    def stop(self):
        self.running = False
    def dataChanged(self):
        self.onDataChanged.set()
