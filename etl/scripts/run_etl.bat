@ECHO OFF
REM Batch script for executing ETL. No error handling!
python ".\data_extraction\get_wikidata_items.py" -d
python ".\data_extraction\get_wikipedia_extracts.py"

python ".\data_enhancement\estimate_movement_period.py"
python ".\data_enhancement\has_part_part_of_enhancement.py"
python ".\data_enhancement\add_youtube_videos.py"

python ".\data_enhancement\ranking.py"

CD crawler_output\intermediate_files\json\

REM Cmd does not resolve wildcards so for each file to be merged add the full name to the list
jq -s "[.[][]]" artworks.json genres.json artists.json locations.json materials.json movements.json motifs.json > art_ontology.json

IF EXIST ..\..\..\crawler_output\art_ontology.json (
    ECHO "art_ontology.json already exist in directory crawler_output. Removing ..."
    DEL ..\..\..\crawler_output\art_ontology.json
)

MOVE art_ontology.json ..\..\..\crawler_output\art_ontology.json

python ..\..\..\data_enhancement\split_languages.py

REM Comment in if wanted
REM python ..\..\..\upload_to_elasticsearch\elasticsearch_helper.py

PAUSE
