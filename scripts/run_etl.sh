#!/bin/sh
script -q -c "./etl.sh" /dev/null | tee etl.log
