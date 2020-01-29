#!/bin/bash
if [ $(id -u) -ne 0 ]
	then echo "The script must be executed with sudo rights"
	exit 1
fi

LOCKFILE=/tmp/update_production.lock
TOKEN=$(cat bot_user_oauth_token)
SERVERNAME=$(uname -n)

if ! mkdir $LOCKFILE 2>/dev/null; then
	curl -X POST https://slack.com/api/chat.postMessage -H "Authorization: Bearer ${TOKEN}" -H 'Content-type: application/json' --data '{"channel":"CRGEZJVA6","text":"Error! Could not acquire the lock file for \"updating the production server\" on server '${SERVERNAME}'! It seems there is already a process running","as_user":"true"}'
    exit 1
fi

script -q -c "./update_elasticsearch_production_from_staging.sh" /dev/null | tee update_production.log
