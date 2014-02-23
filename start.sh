#!/bin/sh
DEBUG=false

while getopts ":d" option
do
    case "$option" in
        d)
            DEBUG=true
            ;;
    esac
done

if ["$DEBUG" -eq true]
then
    ../bin/python app.py
else
    ../bin/uwsgi --ini uwsgi.ini
fi
