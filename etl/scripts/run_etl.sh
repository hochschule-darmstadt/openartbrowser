#!/bin/bash

# Get parameters
while getopts "dhlrt" opt; do
  case $opt in
  h)
    echo "
Usage: run_etl.sh [options]

  -d [number] limits the etl process to a given number of crawled batches per crawled class, default 5
  -r          runs etl process in recovery mode, skipping steps that were already successful in the previous run
  -t [number] runs etl process in test mode, limiting the amount of crawled classes, default 3
  -l          runs etl process in local mode, ignoring slack messages etc
  -h          this test message
    "
    exit 0
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
trap "rm -rf $LOCKFILE" EXIT
SERVERNAME=$(uname -n)

if ! mkdir $LOCKFILE 2>/dev/null; then
  if [ $LOCAL_MODE == true ]; then
    echo "Error! Could not acquire lock file for the ETL-process on server '${SERVERNAME}'! It seems there is already a process running"
  else
    TOKEN=$(cat tokens/bot_user_oauth_token)
    curl -X POST https://slack.com/api/chat.postMessage -H "Authorization: Bearer ${TOKEN}" -H 'Content-type: application/json' --data '{"channel":"CSY0DLRDG","text":"Error! Could not acquire lock file for the ETL-process on server '${SERVERNAME}'! It seems there is already a process running","as_user":"true"}'
  fi
  exit 1
fi

mkdir -p logs
script -q -c "./scripts/etl.sh $@" /dev/null | tee ./logs/etl.log
