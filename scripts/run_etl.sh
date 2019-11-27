cd Wikidata\ crawler
export PYWIKIBOT_NO_USER_CONFIG=1
python3 -c "import ArtOntologyCrawler; ArtOntologyCrawler.extract_art_ontology()"

node ../data_manipulation/script_artworks.js

mv creators.json artists.json
mv depicts.json objects.json

for f in *.json
do
	sed -i 's/"creator"/"artist"/g' $f
	sed -i 's/"depicts"/"objects"/g' $f
done

node ../data_manipulation/script_artworks_rank.js

node ../data_manipulation/script_genres_rank.js
node ../data_manipulation/script_artist_rank.js 
node ../data_manipulation/script_locations_rank.js
node ../data_manipulation/script_materials_rank.js 
node ../data_manipulation/script_movements_rank.js 
node ../data_manipulation/script_objects_rank.js 

node ../data_manipulation/script_flatten_rank.js

cd ../data_manipulation
python3 .\script_add_youtube_videos.py