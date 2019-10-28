cd Wikidata\ crawler
export PYWIKIBOT_NO_USER_CONFIG=1
python3 -c "import ArtOntologyCrawler; ArtOntologyCrawler.extract_art_ontology()"

node ../data_manipulation/script_artworks.js
mv creators.csv artists.csv
node ../data_manipulation/script_artist.js
node ../data_manipulation/script_genres.js
node ../data_manipulation/script_movements.js
node ../data_manipulation/script_materials.js
mv depicts.csv objects.csv
node ../data_manipulation/script_objects.js
node ../data_manipulation/script_locations.js

node ../data_manipulation/script_artworks_rank.js

node ../data_manipulation/script_genres_rank.js
node ../data_manipulation/script_artist_rank.js 
node ../data_manipulation/script_locations_rank.js
node ../data_manipulation/script_materials_rank.js 
node ../data_manipulation/script_movements_rank.js 
node ../data_manipulation/script_objects_rank.js 

node ../data_manipulation/script_flatten_rank.js
