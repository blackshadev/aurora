from flask import Blueprint, Response, request
import json as Json

def blueprint(hue):
    bp = Blueprint("groups", __name__, template_folder="templates")

    @bp.route("/api/groups", methods=["POST"])
    def gGroups():
        resp = hue.getGroups(True)

        return Response(Json.dumps(resp), mimetype="appliction/json")

    @bp.route("/api/groups/<gId>/action", methods=["PUT"])
    def aGroup(gId):
        json = request.user_data

        if "state" in json:
            json["on"] = json["state"]
            del json["state"]
        resp = hue.actionGroup(gId, json)
        return Response(Json.dumps(resp), mimetype="appliction/json")

    return bp

