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
    if [[ -n $nextopt && $nextopt != -* ]] ; then
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
    if [[ -n $nextopt && $nextopt != -* ]] ; then
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
echo "
DEV_MODE $DEV_MODE
DEV_COUNT $DEV_COUNT
REC_MODE $REC_MODE
TEST_MODE $TEST_MODE
CLASS_LIM $CLASS_LIM
LOCAL_MODE $LOCAL_MODE"

LOCKFILE=/tmp/etl.lock
WD=$(pwd)
DATE=$(date +%T_%d-%m-%Y) # German format
SERVERNAME=$(uname -n)

export PYTHONPATH="${PYTHONPATH}:${WD}"
export PYWIKIBOT_DIR="${WD}"

if [ $LOCAL_MODE == true ]; then
  trap "echo \"Oops! Something went wrong while executing the ETL-process\"" ERR
else
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

# Merges all *.json files in the json dir into art_ontology.json
jq -s "[.[][]]" artworks.json genres.json artists.json locations.json materials.json movements.json motifs.json classes.json >art_ontology.json

rm -f ../../../crawler_output/art_ontology.json

# Move the generated art_ontology.json to the directory crawler_output
mv art_ontology.json ../../../crawler_output/art_ontology.json

python3 ../../../data_enhancement/split_languages.py "${params[@]}"

python3 ../../../upload_to_elasticsearch/elasticsearch_helper.py

cd ../../..

# Put the directory and it's files to an archive
# copy them to make the archive available on an nginx endpoint
tar cfvz crawler_output.tar.gz crawler_output/

cp crawler_output.tar.gz /var/www/html

FINISHED_DATE=$(date +%T_%d-%m-%Y)

if [ $LOCAL_MODE == true ]; then
  trap "echo \"ETL-process finished. The lockfile was removed.\""
else
  curl -F file=@${WD}/logs/etl.log -F "initial_comment=ETL-process finished on server ${SERVERNAME} at ${FINISHED_DATE}. The lockfile was removed. Here is the log file" -F channels=CSY0DLRDG -H "Authorization: Bearer ${TOKEN}" https://slack.com/api/files.upload
fi

