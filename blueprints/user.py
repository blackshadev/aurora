from flask import Blueprint, session, request, redirect, Response, render_template
import json as Json


def blueprint(Users):
    bp = Blueprint("user", __name__, template_folder="templates")

    @bp.route("/user", methods=["POST"])
    def gUser():
        resp = request.user.__dict__.copy()
        del resp["secret"]

        return Response(Json.dumps(resp), mimetype="appliction/json")

    @bp.route("/user/colors", methods=["PUT"])
    def sUserColors():
        request.user.setColors(request.user_data)
        return Response("{}", mimetype="appliction/json")

    return bp
