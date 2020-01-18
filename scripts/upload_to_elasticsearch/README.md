## Requirements

To install the required python packages for the ElasticSearch upload script use following command in the scripts directory:
> pip3 install -r requirements.txt

This will install amongst other things elasticsearch and ijson (see requirements.txt)

## Execution

To execute the upload to ElasticSearch:
> python3 elasticsearch_helper.py

If you want to create an index on another environment than the preconfigured server(s) you have to setup a backup directory
and change the ElasticSearch configuration file. More information in the script comments and the wiki (link below)

## ElasticSearch configuration file
The elasticsearch.yml contains all necessary configurations to setup an ElasticSearch server for the openartbrowser. See more on this link https://github.com/hochschule-darmstadt/openartbrowser/wiki/Developer-guide#installation-and-configuration-of-elasticsearch.

## Utility functions
There are also some utility function which can be found within the elasticsearch_helper.py script.