#!/bin/sh
git checkout feature/15_json_in_crawler
cd scripts/Wikidata\ crawler/

mkdir feature && cd feature
export PYWIKIBOT_NO_USER_CONFIG=1
python3 -c "import sys; sys.path.insert(1, '..'); import ArtOntologyCrawler; ArtOntologyCrawler.extract_art_ontology()"

for f in *.json; do mv "$f" "$(echo "$f" | sed s/json/json_feature/)"; done

mv creators.csv artists.csv
mv creators.json_feature artists.json_feature
mv depicts.csv objects.csv
mv depicts.json_feature objects.json_feature

node ../../data_manipulation/script_genres.js
node ../../data_manipulation/script_artist.js
node ../../data_manipulation/script_locations.js
node ../../data_manipulation/script_materials.js
node ../../data_manipulation/script_movements.js
node ../../data_manipulation/script_objects.js

for f in *.json_feature
do
	#sed -i -E 's/ (-?[0-9]+),/"\1",/g' $f
	sed -i -E 's/"date_of_birth": (-?[0-9]+)/"date_of_birth":"\1"/g' $f
	sed -i -E 's/"date_of_death": (-?[0-9]+)/"date_of_death":"\1"/g' $f
	sed -i 's/\[\]/\[""\]/g' $f
	sed -i 's/": /":/g' $f
	sed -i 's/, "/,"/g' $f
	sed -i 's/creator/artist/g' $f
	sed -i 's/"depict"/"object"/g' $f
	sed -i 's/"lat":""/"lat":null/g' $f
	sed -i 's/"lon":""/"lon":null/g' $f
done

counter=0
if [ -z $(diff artists.json creators.json_feature) ]; then
	counter=$((counter+1))
fi
if [ -z $(diff objects.json depicts.json_feature) ]; then
	counter=$((counter+1))
fi
if [ -z $(diff genres.json genres.json_feature) ]; then
	counter=$((counter+1))
fi
if [ -z $(diff locations.json locations.json_feature) ]; then
	counter=$((counter+1))
fi
if [ -z $(diff materials.json materials.json_feature) ]; then
	counter=$((counter+1))
fi
if [ -z $(diff movements.json movements.json_feature) ]; then
	counter=$((counter+1))
fi

echo Tests passed : $(expr $counter)
echo Tests failed : $(expr 6 - $counter)
