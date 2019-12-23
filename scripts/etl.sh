#!/bin/bash
set -eE
set -x 

LOCKFILE=/tmp/etl.lock
TOKEN=$(cat bot_user_oauth_token)
WD=$(pwd)

if ! mkdir $LOCKFILE 2>/dev/null; then
	curl -X POST https://slack.com/api/chat.postMessage -H "Authorization: Bearer ${TOKEN}" -H 'Content-type: application/json' --data '{"channel":"CRGEZJVA6","text":"Error! Could not acquire lock file! It seems there is already a process running","as_user":"true"}'
    exit 1
fi

trap "curl -F file=@${WD}/etl.log -F \"initial_comment=Oops! Something went wrong. Here is the log file: \" -F channels=CRGEZJVA6 -H \"Authorization: Bearer ${TOKEN}\" https://slack.com/api/files.upload" ERR

python3 Wikidata\ crawler/ArtOntologyCrawler.py

cd crawler_output/intermediate_files/json/

node ../../../data_manipulation/script_artworks_rank.js

node ../../../data_manipulation/script_genres_rank.js
node ../../../data_manipulation/script_artist_rank.js 
node ../../../data_manipulation/script_locations_rank.js
node ../../../data_manipulation/script_materials_rank.js 
node ../../../data_manipulation/script_movements_rank.js 
node ../../../data_manipulation/script_motifs_rank.js 

# Merges all *_rank.json files into art_ontology.json
node --max-old-space-size=4096 ../../../data_manipulation/script_flatten_rank.js

if [ -f ../../../crawler_output/art_ontology.json ]; then
    echo "art_ontology.json already exist in directory crawler_output. Removing ..."
    rm ../../../crawler_output/art_ontology.json
fi

# Move the generated art_ontology.json to the directory crawler_output
mv art_ontology.json ../../../crawler_output/art_ontology.json

python3 ../../../data_manipulation/script_add_youtube_videos.py

python3 ../../../data_manipulation/split_languages.py

python3 ../../../upload_to_elasticsearch/elasticsearch_helper.py

cd ../../..

# Put the directory and it's files to an archive 
# copy them to make the archive available on an nginx endpoint
tar cfvz crawler_ouput.tar.gz crawler_output/

cp crawler_output.tar.gz /var/www/html

rm -r $LOCKFILE

