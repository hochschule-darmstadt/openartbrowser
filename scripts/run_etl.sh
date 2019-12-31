#!/bin/sh
if [ $(id -u) -ne 0 ] 
	then echo "The script must be executed with sudo rights"
	exit 1
fi
script -q -c "./etl.sh" /dev/null | tee etl.log
