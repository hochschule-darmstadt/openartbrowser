## Requirements

To install the required python packages for the ElasticSearch upload script use following command in this directory:
> pip3 install -r requirements.txt

This will install elasticsearch and ijson (see requirements.txt)

## Execution

To execute the upload to ElasticSearch:
> python3 -c "import elasticsearch_helper; elasticsearch_helper.create_or_update_index()"

If you want to create an index on another environment than the preconfigured server(s) you have to setup a backup directory
and change the ElasticSearch configuration file. More information in the script comments and the wiki (link below)

## ElasticSearch configuration file
The elasticsearch.yml contains all necessary configurations to setup an ElasticSearch server for the openartbrowser. See more on this link https://github.com/hochschule-darmstadt/openartbrowser/wiki/Developer-guide#installation-and-configuration-of-elasticsearch.

## Utility functions
If you want to list all created snapshots from a repository call:
> python3 -c "import elasticsearch_helper; elasticsearch_helper.list_all_snapshots_from_repository()"

If you want to go back to a snapshot call:
> python3 -c "import elasticsearch_helper; elasticsearch_helper.apply_snapshot_from_repository('SNAPSHOTNAME')"

Again if you use another repository or index than the default values look at the script's comments.