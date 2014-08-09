from flask import Flask, Blueprint, render_template, url_for
from flask import request, current_app, session, redirect, Response
from flask_bootstrap import Bootstrap
from multiprocessing import Process
import sys, signal
import json as Json

#own
from hue.hue import Hue
from config import Config
from user import User, Users
from db import Psycopg2Db
from scheduler import Scheduler

#blueprints
import blueprints.views as views
import blueprints.lights as lights
import blueprints.auth as auth
import blueprints.user as user
import blueprints.settings as settings
import blueprints.groups as groups
import blueprints.scenes as scenes
import blueprints.uni as uni

#db
db_host = "localhost"
db_user = "aurora"
db_db = "aurora"

Db = Psycopg2Db(db_host, db_db, db_user)
Users.Db = Db

#config file
config = Config("aurora.cfg")

# setup hue
hue = Hue(ip="192.168.2.13", logLevel=2)
hue.setConfig(config.section("hue")) 

#setup flask
app = Flask(__name__)
app.secret_key = "stup1ds3cr37s"
Bootstrap(app)

#blueprints
app.register_blueprint(auth.blueprint(Users))
app.register_blueprint(user.blueprint(Users))
app.register_blueprint(views.blueprint(hue))
app.register_blueprint(settings.blueprint(hue))
app.register_blueprint(lights.blueprint(hue))
app.register_blueprint(groups.blueprint(hue, Db))
app.register_blueprint(scenes.blueprint(hue, Db))
app.register_blueprint(uni.blueprint(hue, Db))



session_required = ["views"]
no_sign_required = ["auth", "uni"]

@app.before_request
def before_request():
    if request.endpoint != None and request.endpoint.split(".")[0] in session_required:
        request.user = User(session)
        if not request.user.isValid:
            return redirect("/login")
            
    if(request.method != "GET" and request.endpoint != None and \
     request.endpoint.split(".")[0] not in no_sign_required):
        data = request.get_json()
        isValid, user = Users.validateRequest(data)
        request.user = user
        if not isValid:
            print "not valid"
            resp = {}
            resp[0] = "error"
            resp[1] = "Invalid signature"
            return Response(Json.dumps(resp), mimetype="appliction/json")
        request.user_data = Json.loads(data["data"])

@app.route("/colorpicker")
def colorPicker():
    return render_template("colorPicker.html")

def stop(signum, frame):
    print "closing"
    hue.close()
    config.save()
    sys.exit(0)

def run_server():
    hue.start()
    #atexit.register(onclose)
    app.run(debug=True, use_reloader=False, port=8080, host='0.0.0.0')

if __name__ == '__main__':
    signal.signal(signal.SIGINT, stop)
    run_server()
