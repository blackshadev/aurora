#!/bin/sh

sudo -s

sudo apt-get install python2.7 python2.7-dev python-pip postgresql uwsgi enginx
sudo pip install psycopg2
sudo pip install flask

sudo ln -s $cwd/aurora_nginx.conf /etc/nginx/sites-enabled/

sudo service nginx start
sudo service nginx restart
sudo nginx -s reload
