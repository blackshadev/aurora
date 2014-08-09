from flask import Blueprint, Response, request
import json as Json

def blueprint(hue, Db):
    bp = Blueprint("groups", __name__, template_folder="templates")

    @bp.route("/api/groups", methods=["POST"])
    def gGroups():
        res, cols = Db.execResult("select * from groups")
        
        lights = hue.getLights(True)
        cols.append("state")
        cols.append("color")

        resp = [cols]
        idx = cols.index("lights")
        for row in res:
            state = lights[0][1]["state"]["on"]
            color = lights[0][1]["state"]["rgb"]

            r = list(row)
            lArr = []

            for lId in Json.loads(r[idx]):
                # Check if all states and colors are the same
                if state != lights[lId][1]["state"]["on"]:
                    state = None
                if color != lights[lId][1]["state"]["rgb"]:
                    color = None
                lArr.append(lights[lId])

            r[idx] = lArr

            # Add color and state
            r.append(state)
            r.append(color)

            resp.append(r)

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

