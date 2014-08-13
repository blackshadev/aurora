from flask import Blueprint, Response, request
import json as Json

def blueprint(hue, Db):
    bp = Blueprint("groups", __name__, template_folder="templates")

    group_lights = {}

    @bp.route("/api/groups", methods=["POST"])
    def gGroups():
        res, cols = Db.execResult("select * from groups")
        
        resp = []
        for row in res:
            lghts = Json.loads(row[2])
            resp.append([row[0], { "name": row[1], "lights": lghts}])
            group_lights[row[0]] = lghts
        
        return Response(Json.dumps(resp), mimetype="appliction/json")

    @bp.route("/api/groups/<gId>/state", methods=["PUT"])
    def aGroup(gId):
        lghts = group_lights[int(gId)]

        state = request.user_data
        hue.universalRequest({ "lights": lghts, "body": request.user_data })
        
        resp = {}
        return Response(Json.dumps(resp), mimetype="appliction/json")

    return bp

