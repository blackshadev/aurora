from flask import Blueprint, Response, request
import json as Json

def blueprint(hue, Db):
    bp = Blueprint("groups", __name__, template_folder="templates")

    @bp.route("/api/groups", methods=["POST"])
    def gGroups():
        res, cols = Db.execResult("select * from groups")
        
        resp = [[row[0], { "name": row[1], "lights": Json.loads(row[2])}]for row in res]
        
        return Response(Json.dumps(resp), mimetype="appliction/json")

    @bp.route("/api/groups/<gId>", methods=["PUT"])
    def aGroup(gId):
        res, cols = Db.execResult("select * from groups where id=%s ", gId)
        
        json = request.user_data
        if "state" in json:
            json["on"] = json["state"]
            del json["state"]

            reqJson = {
                "lights": Json.loads(res[0][2]),
                "body": json
            }
            print reqJson

        resp = hue.universalRequest(reqJson)
        return Response(Json.dumps(resp), mimetype="appliction/json")

    return bp

