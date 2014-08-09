import operator
from convertors import Convertor

class LightList(object):
    """
    Class containing Philips lights, 
    this class will automaticly order them
    """
    __dict__ = ["aLights", "full", "hue"]
    def __init__(self, hue, data=None, lightsFilter=None):
        super(LightList, self).__init__()

        if data == None:
            data = hue.getAllData()
        dLights = data["lights"]
        print dLights
        aLights = sorted(dLights.iteritems(), key=operator.itemgetter(0))
        if lightsFilter != None:
            aLights = [x for x in aLights if x[0] in lightsFilter ]
        self.hue = hue
        self.aLights = [ Light(self.hue, x[0], x[1]) for x in aLights ]
    def addRGB(self):
        map(lambda x: x.addRGB(), self.aLights)
    def toList(self):
        return [ x.toObject() for x in self.aLights ]
    def __eq__(self, other):
        same = True
        if  not isinstance(other, self.__class__) \
            or len(self.aLights) != len(other.aLights):
            return False
        #lights are ordered by id so we can iterate on both
        for i in range(0, len(self.aLights)):
            if self.aLights[i] != other.aLights[i]:
                same = False
        return same
    def __ne__(self, other):
        if  not isinstance(other, self.__class__) \
            or len(self.aLights) != len(other.aLights):
            return True
        #lights are ordered by id so we can iterate on both
        for i in range(0, len(self.aLights)):
            if self.aLights[i] != other.aLights[i]:
                return True
        return False

class GroupList(object):
    __dict__ = ["hue", "aGroups"]
    def __init__(self, hue):
        data = hue.getAllData()
        dGroups = data["groups"]
        aGroups = sorted(dGroups.iteritems(), key=operator.itemgetter(0))

        self.hue = hue
        self.aGroups = [ Group(self.hue, x[0], x[1], data) for x in aGroups ]
    def toList(self):
        return [x.toObject() for x in self.aGroups]
    def addRGB(self):
        map(lambda x: x.addRGB(), self.aGroups)

class Group(object):
    __dict__ = ["gId", "name", "lights"]
    def __init__(self, hue, gId, dat, data=None):
        self.hue = hue
        self.gId = gId
        self.dat = dat

        self.aLights = LightList(hue, data, dat["lights"])

        self.name = dat["name"]
    def addRGB(self):
        self.aLights.addRGB()
    def toObject(self):
        return [self.gId, self.dat]

class Light(object):
    __dict__ = ["lId", "data", "hue"]
    """Wrapper for a philips hue light"""
    def __init__(self, hue, lId, data):
        super(Light, self).__init__()
        self.hue = hue
        self.lId = lId
        self.data = data
    def addRGB(self):
        if not "state" in self.data:
            return
        self.data["state"]["rgb"] = self.getRGB()
    def getRGB(self):
        if not "state" in self.data:
            return

        mode = self.data["state"]["colormode"]
        convertor = Convertor(mode)
        r, g, b = convertor.toRGB(self.data["state"])
        return '#{:02x}{:02x}{:02x}'.format(r, g, b)
    def toObject(self):
        return [self.lId, self.data]
    def __eq__(self, other):
        if(self.lId != other.lId):
            return False
        
        if(self.data["name"] != other.data["name"]):
            return False

        diff = DictDiffer(self.data["state"], other.data["state"])
        changed = diff.changed()

        return len(changed) < 1
    def __ne__(self, other):
        return not self == other

class DictDiffer(object):
    """
    Calculate the difference between two dictionaries as:
    (1) items added
    (2) items removed
    (3) keys same in both but changed values
    (4) keys same in both and unchanged values
    """
    def __init__(self, current_dict, past_dict):
        self.current_dict, self.past_dict = current_dict, past_dict
        self.set_current, self.set_past = set(current_dict.keys()), set(past_dict.keys())
        self.intersect = self.set_current.intersection(self.set_past)
    def added(self):
        return self.set_current - self.intersect 
    def removed(self):
        return self.set_past - self.intersect 
    def changed(self):
        return set(o for o in self.intersect if self.past_dict[o] != self.current_dict[o])
    def unchanged(self):
        return set(o for o in self.intersect if self.past_dict[o] == self.current_dict[o])
