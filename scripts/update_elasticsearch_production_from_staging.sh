#!/bin/sh
if [ $(id -u) -ne 0 ] 
	then echo "The script must be executed with sudo rights"
	exit 1
fi

# Remove old archive from last run -f avoid error when file is not existing
rm -f crawler_output.tar.gz

# Get crawler_output from staging
wget -4 http://cai-artbrowserstaging.fbi.h-da.de/crawler_output.tar.gz

# Unpack
tar xfvz crawler_output.tar.gz

python3 upload_to_elasticsearch/elasticsearch_helper.py