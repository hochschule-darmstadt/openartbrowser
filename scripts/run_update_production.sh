#!/bin/bash
if [ $(id -u) -ne 0 ]
	then echo "The script must be executed with sudo rights"
	exit 1
fi
script -q -c "./update_elasticsearch_production_from_staging.sh" /dev/null | tee update_production.log
