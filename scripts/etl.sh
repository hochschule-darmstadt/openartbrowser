#!/bin/bash
set -eE
set -x

LOCKFILE=/tmp/etl.lock
TOKEN=$(cat bot_user_oauth_token)
WD=$(pwd)
DATE=$(date +%T_%d-%m-%Y) # German format
SERVERNAME=$(uname -n)

trap "curl -F file=@${WD}/etl.log -F \"initial_comment=Oops! Something went wrong while executing the ETL-process on server ${SERVERNAME}. Here is the log file: \" -F channels=CSY0DLRDG -H \"Authorization: Bearer ${TOKEN}\" https://slack.com/api/files.upload" ERR

curl -X POST https://slack.com/api/chat.postMessage -H "Authorization: Bearer ${TOKEN}" -H 'Content-type: application/json' --data '{"channel":"CRGEZJVA6","text":"The ETL-process is starting on server '${SERVERNAME}' at '${DATE}'","as_user":"true"}'

./install_etl.sh

python3 data_extraction/art_ontology_crawler.py

cd crawler_output/intermediate_files/json/

node ../../../data_manipulation/script_artworks_rank.js

node ../../../data_manipulation/script_genres_rank.js
node ../../../data_manipulation/script_artist_rank.js
node ../../../data_manipulation/script_locations_rank.js
node ../../../data_manipulation/script_materials_rank.js
node ../../../data_manipulation/script_movements_rank.js
node ../../../data_manipulation/script_motifs_rank.js

# Merges all *_rank.json files into art_ontology.json
node --max-old-space-size=4096 ../../../data_manipulation/merge_art_data.js

rm -f ../../../crawler_output/art_ontology.json

# Move the generated art_ontology.json to the directory crawler_output
mv art_ontology.json ../../../crawler_output/art_ontology.json

python3 ../../../data_manipulation/add_youtube_videos.py

python3 ../../../data_manipulation/split_languages.py

python3 ../../../upload_to_elasticsearch/elasticsearch_helper.py

cd ../../..

# Put the directory and it's files to an archive
# copy them to make the archive available on an nginx endpoint
tar cfvz crawler_output.tar.gz crawler_output/

cp crawler_output.tar.gz /var/www/html

rm -r $LOCKFILE

FINISHED_DATE=$(date +%T_%d-%m-%Y)
curl -F file=@${WD}/etl.log -F "initial_comment=ETL-process finished on server ${SERVERNAME} at ${FINISHED_DATE}. The lockfile was removed. Here is the log file" -F channels=CSY0DLRDG -H "Authorization: Bearer ${TOKEN}" https://slack.com/api/files.upload
