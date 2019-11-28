from elasticsearch import Elasticsearch, helpers
from pathlib import Path
import sys, json
import ijson
import time
import datetime
import uuid
import requests


def create_or_update_index(
    index_name='api',
    repository_name='openartbrowser_index_backup',
    backup_directory='/var/lib/elasticsearch/backup',
    file='/openartbrowser/scripts/crawler_output/ArtOntology.json'):
    """
    Creates or updates an index with new documents. 
    If the passed index exists a snapshot for the current index is created.

    :arg index_name: Index name in which documents should be created or updated
                     The openartbrowser index is called 'api'
    :arg repository_name: Name for a repository which stores snapshots
                          The openartbrowser repository is 'openartbrowser_index_backup'
    :arg backup_directory: Directory in which the repository is located
                          The openartbrowser backup directory is /var/lib/elasticsearch/backup
                          IMPORTANT: 
                          1. The directory has to exist before execution
                          2. This directory is also needed in the elasticsearch.yaml configuration file
                                - Following entry in elasticsearch.yml required:
                                  path.repo: ["path_to_folder"]
    :arg file: Name of the file which contains the documents to be created or updated
               The default file is ArtOntology.json
               It should be located in the repository under ~/openartbrowser/scripts/crawler_output
    """
    # Uses localhost:9200 (elasticsearch default) to create the index with it's documents
    es = Elasticsearch()
    # The openartbrowser repository has to be located in the users directory /home/<username>/openartbrowser
    if not file.startswith('/'):
        file = '/' + file
    file = str(Path.home()) + file
    print("Start creating/updating the index \"" + index_name +
        "\" now. Current time: " + str(datetime.datetime.now()))
    start = time.time()
    if es.indices.exists(index=index_name): # If exists take a snapshot of current docs
        snapshot_name = index_name + "_snapshot_" + time.strftime("%Y%m%d-%H%M%S")
        try:
            es.snapshot.get_repository(repository_name) # Check if repository already was created
        except: # If not create
            es.snapshot.create_repository(repository=repository_name, body={"type": "fs", "settings": {"location": backup_directory}})
        es.snapshot.create(repository=repository_name,snapshot=snapshot_name, body={"indices": index_name})
        print("Snapshot created: " + snapshot_name)
        print("See all snapshots with GET <ElasticSearchServerAdress>/_cat/snapshots/openartbrowser_index_backup")
        print("If fallback to an old snapshot is required close the index with POST <ElasticSearchServerAdress>/" + index_name +"/_close")
        print("After this apply the snapshot, this will reopen the index POST <ElasticSearchServerAdress>/_snapshot/openartbrowser_index_backup/" + snapshot_name + "/_restore")
    else:
        es.indices.create(index=index_name) # Create if index not exists

    update_count = 0
    creation_count = 0
    delete_count = 0

    # Document creation
    for item in ijson.items(open(file, 'r', encoding='utf-8'), 'item'):
        # Search the index by the qid and type (only qId is not unique!)
        result = es.search(index=index_name, body={"query": {"bool": {"must": [{"match": {"id": item['id']}},{"match": {"type": item['type']}}]}}})
        result_length = len(result['hits']['hits'])
        if result_length == 1: # If exists update
            elastic_search_id = result['hits']['hits'][0]['_id']
            es.update(id=elastic_search_id, index=index_name, doc_type='data', body={ 'doc': item })
            update_count += 1
        elif result_length >= 2: # Remove current if it is a duplicate (sanity check should not occur)
            es.delete(id=elastic_search_id, index=index_name, doc_type='data')
            delete_count += 1
            #raise RuntimeError("There is a duplicate document in the index following qId: " + item['id']) ToDo: Comment in if there are problems with duplicates
        else:
            es.create(id=uuid.uuid4(), index=index_name, doc_type='data', body=item)
            creation_count += 1

    end = time.time()
    print(str(creation_count) + " indices were created.")
    print(str(update_count) + " indices were updated.")
    print(str(delete_count) + " indices were deleted (duplicates).")
    print("Finished creating/updating the index current time: " +
        str(datetime.datetime.now()) + " it took " + str((int((end-start)/60))) + " minutes")


def list_all_snapshots_from_repository(
    elastic_search_url='localhost:9200',
    repository_name='openartbrowser_index_backup'):
    """
    Lists all created snapshots in a repository

    :arg elastic_search_url: Url of the ElasticSearch server. On localhost it is 'localhost:9200'
    :arg repository_name: Name of the repository which contains the snapshots
    """
    try:
        req = requests.get(url="http://" + elastic_search_url + "/_cat/snapshots/" + repository_name)
        print(req.text)
    except Exception as e:
        print(str(e))


def apply_snapshot_from_repository(
    snapshot_name,
    index_name='api',
    repository_name='openartbrowser_index_backup'):
    """
    Applies a snapshot created in an earlier creation or update from a repository

    :arg index_name: Name of the index the snapshot should be applied
    :arg repository_name: Name of the repository the snapshot is in
    :arg snapshot_name: Name of the snapshot
    """
    es = Elasticsearch()
    try:
        es.indices.close(index=index_name)
        result = es.snapshot.restore(repository=repository_name, snapshot=snapshot_name)
        print(str(result))
    except Exception as e:
        print(str(e))


if __name__ == "__main__":
    if len(sys.argv) > 0:
        filepath = sys.argv[1]
        create_or_update_index(file=filepath)