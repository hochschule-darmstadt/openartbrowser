#!/bin/bash
# Extracts information about the data extraction from the etl.log file and from the crawled files
echo "Starting with crawling times"

grep -h "Starting with\|Finished with" logs/etl.log

echo "Starting output file statistics"
echo "First output is the column count of the csv"
echo "Second output is the object count of the JSON file"
echo "Remember to add + 1 to the JSON files since the type-attribute is added to them e. g. artwork"

# ToDo: This could be looped through
# Artworks

echo "Drawings columns / attributes"
head -1 crawler_output/intermediate_files/csv/artworks/drawings.csv | sed 's/[^;]//g' | wc -c
echo "Drawings JSON object count"
jq length crawler_output/intermediate_files/json/artworks/drawings.json
echo -e "\n"

echo "Sculptures columns / attributes"
head -1 crawler_output/intermediate_files/csv/artworks/sculptures.csv | sed 's/[^;]//g' | wc -c
echo "Sculptures JSON object count"
jq length crawler_output/intermediate_files/json/artworks/sculptures.json
echo -e "\n"

echo "Paintings columns / attributes"
head -1 crawler_output/intermediate_files/csv/artworks/paintings.csv | sed 's/[^;]//g' | wc -c
echo "Paintings JSON object count"
jq length crawler_output/intermediate_files/json/artworks/paintings.json
echo -e "\n"

echo "Artworks columns / attributes"
# Doesn't matter here since they are the same to those above
head -1 crawler_output/intermediate_files/csv/artworks/paintings.csv | sed 's/[^;]//g' | wc -c
# This is different from the sum of the three above because there are duplicates within them that are skipped
echo "Artwork JSON object count"
jq length crawler_output/intermediate_files/json/artworks.json
echo -e "\n"

echo "Genres columns / attributes"
head -1 crawler_output/intermediate_files/csv/genres.csv | sed 's/[^;]//g' | wc -c
echo "Genres JSON object count"
jq length crawler_output/intermediate_files/json/genres.json
echo -e "\n"

echo "Movements columns / attributes"
head -1 crawler_output/intermediate_files/csv/movements.csv | sed 's/[^;]//g' | wc -c
echo "Movements JSON object count"
jq length crawler_output/intermediate_files/json/movements.json
echo -e "\n"

echo "Materials columns / attributes"
head -1 crawler_output/intermediate_files/csv/materials.csv | sed 's/[^;]//g' | wc -c
echo "Materials JSON object count"
jq length crawler_output/intermediate_files/json/materials.json
echo -e "\n"

echo "Motifs columns / attributes"
head -1 crawler_output/intermediate_files/csv/motifs.csv | sed 's/[^;]//g' | wc -c
echo "Motifs JSON object count"
jq length crawler_output/intermediate_files/json/motifs.json
echo -e "\n"

echo "Artists columns / attributes"
head -1 crawler_output/intermediate_files/csv/artists.csv | sed 's/[^;]//g' | wc -c
echo "Artists JSON object count"
jq length crawler_output/intermediate_files/json/artists.json
echo -e "\n"

echo "Locations columns / attributes"
head -1 crawler_output/intermediate_files/csv/locations.csv | sed 's/[^;]//g' | wc -c
echo "Locations JSON object count"
jq length crawler_output/intermediate_files/json/locations.json
echo -e "\n"

echo "Classes columns / attributes"
head -1 crawler_output/intermediate_files/csv/classes.csv | sed 's/[^;]//g' | wc -c
echo "Classes row count"
wc -l crawler_output/intermediate_files/csv/classes.csv | awk '{print $1-1}'

echo "1 minute throttles because maxlag was exceeded"
grep -h "maxlag" logs/etl.log | wc -l
