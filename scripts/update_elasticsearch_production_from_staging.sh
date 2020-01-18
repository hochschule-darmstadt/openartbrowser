#!/bin/sh
set -eE
set -x 

LOCKFILE=/tmp/update_production.lock
TOKEN=$(cat bot_user_oauth_token)
WD=$(pwd)

if ! mkdir $LOCKFILE 2>/dev/null; then
	curl -X POST https://slack.com/api/chat.postMessage -H "Authorization: Bearer ${TOKEN}" -H 'Content-type: application/json' --data '{"channel":"CRGEZJVA6","text":"Error! Could not acquire the lock file for updating the production server! It seems there is already a process running","as_user":"true"}'
    exit 1
fi

trap "curl -F file=@${WD}/update_production.log -F \"initial_comment=Oops! Something went wrong. Here is the log file: \" -F channels=CRGEZJVA6 -H \"Authorization: Bearer ${TOKEN}\" https://slack.com/api/files.upload" ERR

# Remove old archive from last run -f avoid error when file is not existing
rm -f crawler_output.tar.gz

# Get crawler_output from staging
wget -4 http://cai-artbrowserstaging.fbi.h-da.de/crawler_output.tar.gz

# Unpack
tar xfvz crawler_output.tar.gz

python3 upload_to_elasticsearch/elasticsearch_helper.py

rm -r $LOCKFILE
