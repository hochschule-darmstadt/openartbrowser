@ECHO OFF
REM Batch script for executing ETL. No error handling!
python ".\data_extraction\get_wikidata_items.py" -d
python ".\data_extraction\get_wikipedia_extracts.py"


REM python ".\data_enhancement\estimate_movement_period.py"

python ".\data_enhancement\ranking.py"

CD crawler_output\intermediate_files\json\

REM Merges all *_rank.json files into art_ontology.json
node --max-old-space-size=4096 ..\..\..\data_enhancement\merge_art_data.js

IF EXIST ..\..\..\crawler_output\art_ontology.json (
    ECHO "art_ontology.json already exist in directory crawler_output. Removing ..."
    DEL ..\..\..\crawler_output\art_ontology.json
)

MOVE art_ontology.json ..\..\..\crawler_output\art_ontology.json

python ..\..\..\data_enhancement\add_youtube_videos.py

python ..\..\..\data_enhancement\split_languages.py

REM Comment in if wanted
REM python ..\..\..\upload_to_elasticsearch\elasticsearch_helper.py

PAUSE
