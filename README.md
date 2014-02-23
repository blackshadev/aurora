A control center linked to the philips Hue bridge. 
Al writen in python with flask and postgresql.
It is stil basic, but it will include:
  - Groups for lights
  - Favorite colors per user
  - Session security with HMAC (md5) hashes with a secret random key which is session bound
  - A scheduler (better than the Philips one), for a per day schedule.

Next up:
  - Session security with HMAC and secret key
  - GROUPS