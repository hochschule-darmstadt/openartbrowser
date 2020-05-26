@ECHO OFF
REM Batch script for executing ETL. No error handling!
CD ..
REM Use the parent directory as pywikibot-dir (user-config.py is in there)
SETX PYWIKIBOT_DIR "%~dp0.." /m

python ".\data_extraction\get_wikidata_items.py"
python ".\data_extraction\get_wikipedia_extracts.py"

CD crawler_output\intermediate_files\json\

node --max-old-space-size=4096 ..\..\..\data_manipulation\script_artworks_rank.js

node --max-old-space-size=4096 ..\..\..\data_manipulation\script_genres_rank.js
node --max-old-space-size=4096 ..\..\..\data_manipulation\script_artist_rank.js
node --max-old-space-size=4096 ..\..\..\data_manipulation\script_locations_rank.js
node --max-old-space-size=4096 ..\..\..\data_manipulation\script_materials_rank.js
node --max-old-space-size=4096 ..\..\..\data_manipulation\script_movements_rank.js
node --max-old-space-size=4096 ..\..\..\data_manipulation\script_motifs_rank.js

REM Merges all *_rank.json files into art_ontology.json
node --max-old-space-size=4096 ..\..\..\data_manipulation\merge_art_data.js

IF EXIST ..\..\..\crawler_output\art_ontology.json (
    ECHO "art_ontology.json already exist in directory crawler_output. Removing ..."
    DEL ..\..\..\crawler_output\art_ontology.json
)

MOVE art_ontology.json ..\..\..\crawler_output\art_ontology.json

python ..\..\..\data_manipulation\add_youtube_videos.py

python ..\..\..\data_manipulation\split_languages.py

REM Comment in if wanted
REM python ..\..\..\upload_to_elasticsearch\elasticsearch_helper.py

PAUSE
