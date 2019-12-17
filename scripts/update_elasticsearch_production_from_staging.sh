#!/bin/sh
# Get crawler_output from staging
wget -4 http://cai-artbrowserstaging.fbi.h-da.de/crawler_output.tar.gz

# Unpack
tar xfvz crawler_output.tar.gz

python3 upload_to_elasticsearch/elasticsearch_helper.py