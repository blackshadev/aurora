from flask import Blueprint, Response, request
import json as Json

def blueprint(hue):
    bp = Blueprint("settings", __name__, template_folder="templates")

    @bp.route("/api/settings", methods=["PUT"])
    def setSettings():
        json = request.get_json()

        bools = ["dhcp"]
        accepted = ["name", "dhcp", "ipaddress", "netmask", "gateway", \
         "proxyadddress", "proxyport"]

        dat = dict( (el, json[el]) for el in accepted if el in json )

        for el in bools:
            if el in dat:
                dat[el] = dat[el] == 'true'
        
        
        resp = hue.setSettings(dat)
        return Response(Json.dumps(resp), mimetype="appliction/json")

    @bp.route("/api/settings", methods=["POST"])
    def settings():
        settings = hue.getSettings()
        
        resp = Response(Json.dumps(settings), mimetype="appliction/json")
        resp.cache_control.no_cache = True
        
        return resp    

    return bp