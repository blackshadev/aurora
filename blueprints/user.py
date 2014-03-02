from flask import Blueprint, session, request, redirect, Response, render_template
import json as Json


def blueprint(Users):
    bp = Blueprint("user", __name__, template_folder="templates")

    @bp.route("/user", methods=["POST"])
    def gUser():
        return Response(Json.dumps(request.user.__dict__), mimetype="appliction/json")

    return bp
