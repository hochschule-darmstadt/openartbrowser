#!/bin/bash
set -eE
set -x

LOCKFILE=/tmp/update_production.lock
TOKEN=$(cat tokens/bot_user_oauth_token)
WD=$(pwd)
DATE=$(date +%T_%d-%m-%Y) # German format
SERVERNAME=$(uname -n)

export PYTHONPATH="${PYTHONPATH}:${WD}"

trap "curl -F file=@${WD}/logs/update_production.log -F \"initial_comment=Oops! Something went wrong while updating the production server on server ${SERVERNAME}. Here is the log file: \" -F channels=CSY0DLRDG -H \"Authorization: Bearer ${TOKEN}\" https://slack.com/api/files.upload" ERR

curl -X POST https://slack.com/api/chat.postMessage -H "Authorization: Bearer ${TOKEN}" -H 'Content-type: application/json' --data '{"channel":"CSY0DLRDG","text":"The update-production-server process is starting on server '${SERVERNAME}' current date is '${DATE}'","as_user":"true"}'

# Remove old archive from last run -f avoid error when file is not existing
rm -f crawler_output.tar.gz

# Get crawler_output from staging
# Note: wget with IPv6 (without -4 flag) wasn't working
wget -4 http://cai-artbrowserstaging.fbi.h-da.de/crawler_output.tar.gz

# Unpack
tar xfvz crawler_output.tar.gz

python3 upload_to_elasticsearch/elasticsearch_helper.py

# Move current frontend to html_DATE and copy master deployment to /var/www/html
mv /var/www/html /var/www/html_$DATE && cp -R /var/sftp/deployment/ /var/www/html

rm -r $LOCKFILE

FINISHED_DATE=$(date +%T_%d-%m-%Y)
curl -F file=@${WD}/logs/update_production.log -F "initial_comment=update-production-server process finished on server ${SERVERNAME} at ${FINISHED_DATE}. The lockfile was removed. Here is the log file" -F channels=CSY0DLRDG -H "Authorization: Bearer ${TOKEN}" https://slack.com/api/files.upload
