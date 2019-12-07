#!/bin/sh
pip3 install -r Wikidata\ crawler/requirements.txt
pip3 install -r data_manipulation/requirements.txt
cd data_manipulation
npm install
cd ..
pip3 install -r upload_to_elasticsearch/requirements.txt
