from flask import Blueprint, session, request, redirect, Response, render_template
import json as Json


def blueprint(Users):
    bp = Blueprint("auth", __name__, template_folder="templates")

    @bp.route("/login", methods=["GET"])
    def loginPage():
        if("sessid" in session and Users.isLogged(session["sessid"])):
            return redirect("/")
        return render_template("login.html")

    @bp.route("/login", methods=["POST"])
    def loginUser():
        json = request.get_json()
        
        user = Users.auth(json["username"], json["pass"])
        resp = {}

        if(user.isValid):
            resp[0] = "success"
            resp["sess"] = user.sessid
            resp["secret"] = user.secret
            session["sessid"] = user.sessid
        else:
            resp[0] = "error"

        return Response(Json.dumps(resp), mimetype="appliction/json")

    @bp.route("/login", methods=["PUT"])
    def loginSession():
        json = request.get_json()
        resp = {}

        user = Users.getUser(json["sess"])

        if(user.isValid):
            resp[0] = "success"
            resp["sess"] = user.sessid
            resp["secret"] = user.secret
            session["sessid"] = user.sessid
        else:
            resp[1] = "failed"
        return Response(Json.dumps(resp), mimetype="appliction/json")

    @bp.route("/logout", methods=["DELETE"])
    def logout():
        json = request.get_json()

        if "sessid" in json and "secret" in json:
                Users.logout(json["sessid"], json["secret"])
        session.clear()
        return "{}"

    return bp
