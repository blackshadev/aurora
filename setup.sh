#!/bin/sh

sudo -s

sudo apt-get install python2.7 python2.7-dev python-pip postgresql uwsgi enginx
sudo pip install psycopg2
sudo pip install flask

sudo ln -s $cwd/aurora_nginx.conf /etc/nginx/sites-enabled/

sudo service nginx start
sudo service nginx restart
sudo nginx -s reload

#db
sudo su - postgres
createuser aurora
createdb -O aurora aurora
exit

#tables
psql -U aurora -d aurora -a -f db/users.sql
psql -U aurora -d aurora -a -f db/scenes.sql

#procs
psql -U aurora -d aurora -a -f db/procs/random_string.sql
psql -U aurora -d aurora -a -f db/procs/gUser_Session.sql
psql -U aurora -d aurora -a -f db/procs/authUser.sql
psql -U aurora -d aurora -a -f db/procs/renew_string.sql
psql -U aurora -d aurora -a -f db/procs/rUser_Session.sql




