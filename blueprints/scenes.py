from flask import Blueprint, Response, request
import json as Json
import psycopg2

def blueprint(hue, Db):
    bp = Blueprint("scenes", __name__, template_folder="templates")

    @bp.route("/api/scenes", methods=["POST"])
    def scenes():
        res = Db.execResult("select * from scenes")
        return Response(Json.dumps(res), mimetype="appliction/json")


    return bp