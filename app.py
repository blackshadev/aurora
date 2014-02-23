from flask import Flask, Blueprint, render_template, url_for
from flask import request, current_app, session, redirect, Response
from flask_bootstrap import Bootstrap
import atexit
import json as Json
#own
from hue.hue import Hue
from config import Config
from user import User, Users
#blueprints
import blueprints.views as views
import blueprints.lights as lights
import blueprints.user as user
import blueprints.settings as settings
import blueprints.groups as groups

#config file
config = Config("aurora.cfg")

# setup hue
hue = Hue(ip="192.168.2.13")
hue.setConfig(config.section("hue")) 

#setup flask
app = Flask(__name__)
app.secret_key = "stup1ds3cr37s"
Bootstrap(app)

#blueprints
app.register_blueprint(user.blueprint(Users))
app.register_blueprint(views.blueprint(hue))
app.register_blueprint(settings.blueprint(hue))
app.register_blueprint(lights.blueprint(hue))
app.register_blueprint(groups.blueprint(hue))

session_required = ["views"]
no_sign_required = ["user"]

@app.before_request
def before_request():
    if request.endpoint != None and request.endpoint.split(".")[0] in session_required:
        request.user = User(session)
        if not request.user.isValid:
            return redirect("/login")
            
    if(request.method != "GET" and request.endpoint != None and \
     request.endpoint.split(".")[0] not in no_sign_required):
        isValid = Users.validateRequest(request.get_json())
        if not isValid:
            print "not valid"
            resp = {}
            resp[0] = "error"
            resp[1] = "Invalid signature"
            return Response(Json.dumps(resp), mimetype="appliction/json")

@app.route("/colorpicker")
def colorPicker():
    return render_template("colorPicker.html")

def onclose():
    print "closing"
    hue.close()
    config.save()

if __name__ == '__main__':
    hue.start()
    atexit.register(onclose)
    app.run(debug=True, port=8080, host='0.0.0.0')
