
from flask import Blueprint, Response, request
from convertors import Convertor
import json as Json

def badArguments(la, args):
    print "Bad Arguments"
    print Json.dumps(args)
    resp = {}
    resp["error"] = "Bad arguments"
    resp["args"] = args
    return Response(Json.dumps(resp), mimetype="appliction/json")


def blueprint(hue):
    bp = Blueprint("lights", __name__, template_folder="templates")

    @bp.route("/api/lights/<lId>/state", methods=['PUT'])
    def setLightState(lId):
        json = request.user_data

        if "state" not in json:
            return badArguments(Response, json)

        state = json["state"];

        resp = hue.setLightState(lId, {"on":state});
        return Response(Json.dumps(resp), mimetype="appliction/json")

    @bp.route("/api/lights/<lId>/color", methods=['PUT'])
    def setLightColor(lId):
        json = request.user_data

        if "color" not in json or "mode" not in json:
            return badArguments(Response, json)

        if(json["mode"] == "hsl"):
            conv = Convertor("hsl")
            h, sat, bri = conv.toHSV(json["color"])

            resp = hue.setLightState(lId, {"hue": h, "bri": bri, "sat": sat })
        elif(json["mode"] == "xy"):
            obj = { "xy": [ json["color"][0], json["color"][1] ], "bri": None }
            if(len(json["color"]) > 2 ):
                obj["bri"] = json["color"][2]

            resp = hue.setLightState(lId, obj)

        return Response(Json.dumps(resp), mimetype="appliction/json")
    @bp.route("/api/lights/<lId>/name", methods=['PUT'])
    def setLightName(lId):
        json = request.user_data

        if "name" not in json:
            return badArguments(Response, json)

        resp = hue.setLightName(lId, { "name": json["name"] })
        return Response(Json.dumps(resp), mimetype="appliction/json")

    # Post is used because we need to validate the request
    @bp.route("/api/lights", methods=["POST"])
    def lights():
        lights = hue.getLights(True)
        
        resp = Response(Json.dumps(lights), mimetype="appliction/json")
        resp.cache_control.no_cache = True
        
        return resp

    return bp