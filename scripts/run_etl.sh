#!/bin/sh 

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
node ../../../data_manipulation/script_flatten_rank.js

# Move the generated art_ontology.json to the directory crawler_output
mv art_ontology.json ../../../crawler_output/art_ontology.json

python3 ../../../data_manipulation/script_add_youtube_videos.py

python3 ../../../Wikidata\ crawler/split_languages.py
