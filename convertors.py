import math

def xy2rgb(values):
    x, y = values["xy"]
    z = 1. - x - y
    Y = values["bri"] / 255.
    X = (Y / y) * x
    Z = (Y / y) * z

    r = X * 3.2406 - Y * 1.5372 - Z * 0.4986 
    g = -X * 0.9689 + Y * 1.8758 + Z * 0.0415
    b = X * 0.0557 - Y * 0.204 + Z * 1.057

    # Gamma correction
    r = 12.92 * r if r <= 0.0031308 else (1.0 + 0.055) * (r ** (1.0 / 2.4)) - 0.055
    g = 12.92 * g if g <= 0.0031308 else (1.0 + 0.055) * (g ** (1.0 / 2.4)) - 0.055
    b = 12.92 * b if b <= 0.0031308 else (1.0 + 0.055) * (b ** (1.0 / 2.4)) - 0.055
    # Correct values if one is greater than 1
    maxValue = max(r, g, b)
    if maxValue > 1:
        r /= maxValue
        g /= maxValue
        b /= maxValue

    # no negatives allowed
    r = max(r, 0)
    g = max(g, 0)
    b = max(b, 0)

    return (r * 255, g * 255, b * 255)

def hs2rgb(values):

    def rgb_(H, C, X):
        if 0 <= H and H < 60:
            return C, X, 0
        if 60 <= H and H < 120:
            return X, C, 0
        if 120 <= H and H < 180:
            return 0, C, X
        if 180 <= H and H < 240:
            return 0, X, C
        if 240 <= H and H < 300:
            return X, 0, C
        if 300 <= H and H < 360:
            return C, 0, X

    H = values["hue"] / 65535. * 360.
    C = values["bri"] / 255. * values["sat"] / 255.
    X = C * (1 - abs( ( (H / 60) % 2.) - 1.))


    R, G, B = rgb_(H, C, X)
    m = values["bri"] / 255. - C

    res = (R + m, G + m, B + m)
    res = tuple(x * 255 for x in res)
    return res

    

"""http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/"""
def ct2rgb(values):
    ct = 1000000. / values["ct"]
    temp = ct / 100.

    if(temp > 66):
        # red
        r = temp - 60
        r = 329.698727446 * (r ** -0.1332047592)
        #green
        g = temp - 60
        g = 288.1221695283 * (g ** -0.0755148492)
    else:
        #red
        r = 255
        #green
        g = temp
        g = 99.4708025861 * math.log(g) - 161.1195681661
    #blue
    if temp >= 66:
        b = 255
    else:
        if temp <= 19:
            blue = 0
        else:
            b = temp - 10
            b = 138.5177312231 * math.log(b) - 305.0447927307

    return ( min(max(r, 0), 255), min(max(g, 0), 255), min(max(b, 0), 255) )

def hsl2hsv(values):
    h, s, l = values
    B = (2. * l + s * (1. - abs(2. * l - 1.))) / 2.

    S = 2. * ( B - l) / B if B != 0 else 1

    # ohh philips u so silly
    h *= 65535. / 360.
    S *= 255.
    B *= 255.

    return (h, S, B)

class Convertor:
    __dict__ = ["mode"]
    def __init__(self, mode):
        self.mode = mode
    def toRGB(self, values):
        if(self.mode == "xy"):
            res = xy2rgb(values)
        elif(self.mode == "hs"):
            res = hs2rgb(values)
        elif(self.mode == "ct"):
            res = ct2rgb(values)
        return tuple(int(round(x)) for x in res)
    def toHSV(self, values):
        if(self.mode == "hsl"):
            res = hsl2hsv(values)
        return tuple(int(round(x)) for x in res)
