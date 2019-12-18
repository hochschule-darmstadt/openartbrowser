#!/bin/bash
set -eE
set -x 

trap 'exit' ERR

python3 Wikidata\ crawler/ArtOntologyCrawler.py -d

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

# ToDo: Use in this script when error handling is implemented
#python3 ../../../upload_to_elasticsearch/elasticsearch_helper.py
