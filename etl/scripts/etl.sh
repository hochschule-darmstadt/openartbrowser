#!/bin/bash
set -eE
set -x

DEV_COUNT=5

# Get parameters d and r (dev counter and recovery mode)
while getopts "d:r" opt; do
  echo $opt
  case $opt in
    d) DEV_MODE=true && DEV_COUNT="$OPTARG"
    ;;
    r) REC_MODE=true
    ;;
    \?) echo "Invalid option -$OPTARG" >&2 && exit 1
    ;;
  esac
done

LOCKFILE=/tmp/etl.lock
TOKEN=$(cat tokens/bot_user_oauth_token)
WD=$(pwd)
DATE=$(date +%T_%d-%m-%Y) # German format
SERVERNAME=$(uname -n)

export PYTHONPATH="${PYTHONPATH}:${WD}"
export PYWIKIBOT_DIR="${WD}"

trap "curl -F file=@${WD}/logs/etl.log -F \"initial_comment=Oops! Something went wrong while executing the ETL-process on server ${SERVERNAME}. Here is the log file: \" -F channels=CSY0DLRDG -H \"Authorization: Bearer ${TOKEN}\" https://slack.com/api/files.upload" ERR

ETL_STATES_FILE=$WD/logs/etl_states.log
[[ -z ${REC_MODE+x} &&  -f "$ETL_STATES_FILE" ]] && rm $ETL_STATES_FILE

# build parameters for each script
params=() && [[ $DEV_MODE == true ]] && params+=('-d' "$DEV_COUNT")
[[ $REC_MODE == true ]] && params+=('-r')
python3 data_extraction/get_wikidata_items.py "${params[@]}"

params=() && [[ $REC_MODE == true ]] && params+=(-r)
python3 data_extraction/get_wikipedia_extracts.py "${params[@]}"

# DATA TRANSFORMATION / "Enhancement

python3 data_enhancement/estimate_movement_period.py

python3 data_enhancement/has_part_part_of_enhancement.py

python3 data_enhancement/add_youtube_videos.py

python3 data_enhancement/ranking.py

cd crawler_output/intermediate_files/json/

# Merges all *.json files in the json dir into art_ontology.json
jq -s "[.[][]]" artworks.json genres.json artists.json locations.json materials.json movements.json motifs.json classes.json > art_ontology.json

rm -f ../../../crawler_output/art_ontology.json

# Move the generated art_ontology.json to the directory crawler_output
mv art_ontology.json ../../../crawler_output/art_ontology.json

python3 ../../../data_enhancement/split_languages.py

python3 ../../../upload_to_elasticsearch/elasticsearch_helper.py

cd ../../..

# Put the directory and it's files to an archive
# copy them to make the archive available on an nginx endpoint
tar cfvz crawler_output.tar.gz crawler_output/

cp crawler_output.tar.gz /var/www/html

rm -r $LOCKFILE

FINISHED_DATE=$(date +%T_%d-%m-%Y)
curl -F file=@${WD}/logs/etl.log -F "initial_comment=ETL-process finished on server ${SERVERNAME} at ${FINISHED_DATE}. The lockfile was removed. Here is the log file" -F channels=CSY0DLRDG -H "Authorization: Bearer ${TOKEN}" https://slack.com/api/files.upload
