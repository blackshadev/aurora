from flask import Flask, Blueprint, render_template, Response, request
import json as Json

def blueprint(hue):
    views = Blueprint("views", __name__, template_folder="templates")

    @views.route('/')
    def index():
        return render_template("index.html", user=request.user)

    @views.route('/groups')
    def groups():
        return render_template("groups.html", user=request.user)

    @views.route('/lights')
    def lights():
        return render_template("lights.html", user=request.user)

    @views.route('/settings')
    def settings():
        return render_template("settings.html", user=request.user)

    return views