#!/bin/bash

# Get parameters
while getopts "hldrt" opt; do
  case $opt in
  h)
    echo "
Usage: run_etl.sh [options]

  -d [number] limits the etl process to a given number of crawled batches per crawled class, default 5
  -r          runs etl process in recovery mode, skipping steps that were already successful in the previous run
  -t [number] runs etl process in test mode, limiting the amount of crawled classes, default 3
  -h          this test message
    "
    ;;
  l)
    LOCAL_MODE=true
    ;;
  \?)
    echo "Invalid option -$OPTARG" >&2 && exit 1
    ;;
  esac
done

LOCKFILE=/tmp/etl.lock
trap "rm -rf $LOCKFILE; echo \"lock file deleted\"" ERR EXIT
if ! mkdir $LOCKFILE 2>/dev/null; then
  if [ ! $LOCAL_MODE ]; then
    TOKEN=$(cat tokens/bot_user_oauth_token)
    SERVERNAME=$(uname -n)
    curl -X POST https://slack.com/api/chat.postMessage -H "Authorization: Bearer ${TOKEN}" -H 'Content-type: application/json' --data '{"channel":"CSY0DLRDG","text":"Error! Could not acquire lock file for the ETL-process on server '${SERVERNAME}'! It seems there is already a process running","as_user":"true"}'
  else
    echo "Error! Could not acquire lock file for the ETL-process"
  fi
  exit 1
fi

mkdir -p logs
echo "run etl"
script -q -c "./scripts/etl.sh $1 $2 $3 $4 $5 $6" /dev/null | tee ./logs/etl.log
