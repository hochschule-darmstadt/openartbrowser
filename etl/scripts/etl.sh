#!/bin/bash
set -eE
set -x

# Get parameters d, r and t (dev counter, recovery mode and test mode)
while getopts "dlrt" opt; do
  case $opt in
  d)
    DEV_MODE=true
    # Check next positional parameter
    eval nextopt=\${$OPTIND}
    # existing or starting with dash?
    if [[ -n $nextopt && $nextopt != -* ]]; then
      OPTIND=$((OPTIND + 1))
      DEV_COUNT=$nextopt
    else
      DEV_COUNT=5
    fi
    ;;
  l)
    LOCAL_MODE=true
    ;;
  r)
    REC_MODE=true
    ;;
  t)
    TEST_MODE=true
    # Check next positional parameter
    eval nextopt=\${$OPTIND}
    # existing or starting with dash?
    if [[ -n $nextopt && $nextopt != -* ]]; then
      OPTIND=$((OPTIND + 1))
      CLASS_LIM=$nextopt
    else
      CLASS_LIM=5
    fi
    ;;
  \?)
    echo "Invalid option -$OPTARG" >&2 && exit 1
    ;;
  esac
done

LOCKFILE=/tmp/etl.lock
WD=$(pwd)
DATE=$(date +%T_%d-%m-%Y) # German format
SERVERNAME=$(uname -n)

export PYTHONPATH="${PYTHONPATH}:${WD}"
export PYWIKIBOT_DIR="${WD}"
if [ ! $LOCAL_MODE ]; then
  TOKEN=$(cat tokens/bot_user_oauth_token)
  trap "curl -F file=@${WD}/logs/etl.log -F \"initial_comment=Oops! Something went wrong while executing the ETL-process on server ${SERVERNAME}. Here is the log file: \" -F channels=CSY0DLRDG -H \"Authorization: Bearer ${TOKEN}\" https://slack.com/api/files.upload" ERR
fi

curl -X POST https://slack.com/api/chat.postMessage -H "Authorization: Bearer ${TOKEN}" -H 'Content-type: application/json' --data '{"channel":"CSY0DLRDG","text":"The ETL-process is starting on server '${SERVERNAME}' at '${DATE}'","as_user":"true"}'
ETL_STATES_FILE=$WD/logs/etl_states.log
[[ -z ${REC_MODE+x} && -f "$ETL_STATES_FILE" ]] && rm $ETL_STATES_FILE

# build parameters for each script
params=() && [[ $DEV_MODE == true ]] && params+=('-d' "$DEV_COUNT")
[[ $REC_MODE == true ]] && params+=('-r')
[[ $TEST_MODE == true ]] && params+=('-t' "$CLASS_LIM")
python3 data_extraction/get_wikidata_items.py "${params[@]}"

params=() && [[ $REC_MODE == true ]] && params+=(-r)
python3 data_extraction/get_wikipedia_extracts.py "${params[@]}"

# DATA TRANSFORMATION / "Enhancement

python3 data_enhancement/estimate_movement_period.py "${params[@]}"

python3 data_enhancement/has_part_part_of_enhancement.py "${params[@]}"

python3 data_enhancement/add_youtube_videos.py "${params[@]}"

python3 data_enhancement/ranking.py "${params[@]}"

cd crawler_output/intermediate_files/json/
# Instead of merging all into one large JSON file, stream-merge and split into
# per-language NDJSON batch files to avoid large memory/ES indexing issues.
split_args=()
[[ $REC_MODE == true ]] && split_args+=(-r)
BATCH_SIZE=${ART_ONTOLOGY_BATCH_SIZE:-2000}
python3 ../../../data_enhancement/split_languages.py -b "$BATCH_SIZE" "${split_args[@]}"

python3 ../../../upload_to_elasticsearch/elasticsearch_helper.py

cd ../../..

# Put the directory and it's files to an archive
# copy them to make the archive available on an nginx endpoint
tar cfvz crawler_output.tar.gz crawler_output/

cp crawler_output.tar.gz /var/www/html

rm -r $LOCKFILE

FINISHED_DATE=$(date +%T_%d-%m-%Y)
curl -F file=@${WD}/logs/etl.log -F "initial_comment=ETL-process finished on server ${SERVERNAME} at ${FINISHED_DATE}. The lockfile was removed. Here is the log file" -F channels=CSY0DLRDG -H "Authorization: Bearer ${TOKEN}" https://slack.com/api/files.upload
