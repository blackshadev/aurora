from flask import Flask, Blueprint, render_template, Response, request
import json as Json

def blueprint(hue):
    views = Blueprint("views", __name__, template_folder="templates")

    @views.route('/')
    def index():
        return render_template("index.html")

    @views.route('/groups')
    def groups():
        return render_template("async/groups.html")

    @views.route('/lights')
    def lights():
        return render_template("async/lights.html")

    @views.route('/scenes')
    def scenes():
        return render_template("async/scenes.html")

    @views.route('/settings')
    def settings():
        return render_template("async/settings.html")

    @views.route('/debug')
    def debug():
        return render_template("async/debug.html")

    return views