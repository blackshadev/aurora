from flask import Blueprint, Response, request
import json as Json
import requests
import httplib

# Generic hue api
def blueprint(hue, Db):
    bp = Blueprint("uni", __name__, template_folder="templates")

    """
    body example
    {
        "lights": [1,2],
        "groups": [3,4],
        "body": {
            "state": "on"
       }
    }
    """
    @bp.route("/api", methods=["PUT"])
    def universal():
        req = hue.universalRequests(request.get_json())
        req.sendAll()
        return Response(Json.dumps({}), mimetype="appliction/json")


    return bp

