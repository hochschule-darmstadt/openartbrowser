#!/bin/bash
set -eE
set -x
WD=$(pwd)
export PYTHONPATH="${PYTHONPATH}:${WD}"
export PYWIKIBOT_DIR="${WD}"
cd crawler_output/intermediate_files/json/

python3 ../../../upload_to_elasticsearch/elasticsearch_helper.py
echo "Finished Upload"