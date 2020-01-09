from elasticsearch import Elasticsearch, helpers
from pathlib import Path
import sys, json
import ijson
import time
import datetime
import uuid
import requests
import sys
import csv


def create_empty_index(
    index_name
) -> bool:
    """
    Creates an empty index (meaning no documents inside).

    :arg index_name: Name of the index to be created.

    Returns:
        True if index didn't exist and could be created else False.
    """
    es = Elasticsearch()

    if es.indices.exists(index=index_name):
        print("Index with the name " + index_name + " already exists")
        return False
    es.indices.create(index=index_name)
    return True


def delete_index(index_name) -> bool:
    """
    Delete an index by it's name.

    :arg index_name: Name of the index to be deleted.

    Returns:
        True if index extists and could be deleted else False.
    """
    es = Elasticsearch()
    if es.indices.exists(index=index_name):
        print("Deleting index: " + index_name + " now")
        es.indices.delete(index_name)
        return True
    print("The index: " + index_name + "to be deleted doesn't exist")
    return False


def create_index(
    index_name,
    file) -> None:
    """
    Creates an index with new documents from art_ontology_<language_code>.json.

    :arg index_name: Index name in which documents should be created.
    :arg file: Name of the file which contains the documents to be created 
               e. g. art_ontology_<language_code>.json.
    """
    # Uses localhost:9200 (elasticsearch default) to create the index with it's documents
    es = Elasticsearch()
    print("Start creating the index \"" + index_name +
        "\" now. Current time: " + str(datetime.datetime.now()))
    start = time.time()

    print("Checking if index with the name " + index_name + " can be created ...")
    if(create_empty_index(index_name=index_name)):
        print("Index " + index_name + " created successfully")
    else:
        print("Stopping index creation from file " + file)
        return

    creation_count = 0

    # Document creation
    for item in ijson.items(open(file, 'r', encoding='utf-8'), 'item'):
        es.create(id=uuid.uuid4(), index=index_name, doc_type='data', body=item)
        creation_count += 1

    end = time.time()
    print(str(creation_count) + " documents were created in index " + index_name)
    print("Finished creating the index current time: " +
        str(datetime.datetime.now()) + " it took " + str((int((end-start)/60))) + " minutes")


def swap_index(index_name_new, index_name_current, index_name_old) -> bool:
    """
    Swaps the new index with the current one the current will
    be backed up in index_name_old.
    This is possible because the backup and restore feature of elasticsearch
    allows renaming when restoring a snapshot.

    :arg index_name_new: Newly created index which replaces the current index.
    :arg index_name_current: The current index which replaces the old index.
    :arg index_name_old: The old index which will be deleted.
    Returns:
        True when the index swap worked else False.
    """
    es = Elasticsearch()
    print("Checking if current index exists")
    # Check for newly setup ElasticSearch-Server
    if not es.indices.exists(index=index_name_current):
        print("The current index named: \"" + index_name_current + 
        "\" does not exist. It will be created now ...")
        create_empty_index(index_name=index_name_current)
    if not es.indices.exists(index=index_name_new):
        print("The new index named: \"" + index_name_new +
                "\" does not exist therefore the swap cannot be executed")
        return False

    print("Creating snapshots from given indices to swap")
    snapshot_appendix = "_snapshot"
    index_new_snapshot = index_name_new + snapshot_appendix
    index_current_snapshot = index_name_current + snapshot_appendix
    # Snapshot the new index
    create_snapshot_for_index(
        index_name=index_name_new,
        snapshot_name=index_new_snapshot)
    # Snapshot the current index
    create_snapshot_for_index(
        index_name=index_name_current,
        snapshot_name=index_current_snapshot)
    list_all_snapshots_from_repository()

    # First swap
    # Check if index_name_current_old exists if it does delete index
    
    if(es.indices.exists(index_name_old)):
        es.indices.delete(index_name_old)
    # Apply snapshot to index_name_current and rename it to index_name_current_old
    apply_snapshot_from_repository(
        snapshot_name=index_current_snapshot, 
        index_name=index_name_current,
        new_index_name=index_name_old)

    # Second swap
    # Apply index_new_snapshot on index_current
    apply_snapshot_from_repository(
        snapshot_name=index_new_snapshot,
        index_name=index_name_new,
        new_index_name=index_name_current)

    # Now the indices should be swapped
    # Cleanup
    # Remove created snapshots
    delete_snapshot_from_repository(snapshot_name=index_new_snapshot)
    delete_snapshot_from_repository(snapshot_name=index_current_snapshot)

    # Delete index_name_new
    delete_index(index_name_new)
    return True


def create_snapshot_for_index(
    index_name,
    snapshot_name,
    repository_name='openartbrowser_index_backup',
    backup_directory='/var/lib/elasticsearch/backup') -> None:
    """
    :arg index_name: Index for which the snapshot should be created for.
    :arg snapshot_name: Name for the snapshot.
    :arg repository_name: Name for a repository which stores snapshots.
                          The openartbrowser repository is 'openartbrowser_index_backup'.
    :arg backup_directory: Directory in which the repository is located.
                           The openartbrowser backup directory is /var/lib/elasticsearch/backup
                           IMPORTANT:
                           1. The directory has to exist before execution
                           2. This directory is also needed in the elasticsearch.yaml configuration file
                               - Following entry in elasticsearch.yml required:
                               path.repo: ["path_to_folder"]
    """
    # Increase timeout because creating snapshots had exceeded the default timeout of 10 seconds
    es = Elasticsearch(timeout=30) 

    try:
        # Check if repository already was created
        es.snapshot.get_repository(repository_name)
    except:  # If not create
        es.snapshot.create_repository(repository=repository_name, body={
                                      "type": "fs", "settings": {"location": backup_directory}})
    if es.indices.exists(index=index_name):
        try:
            # Check if this snapshot was deleted if not remove it
            es.snapshot.get(repository=repository_name, snapshot=snapshot_name)
            delete_snapshot_from_repository(snapshot_name)
        except:
            pass
        es.snapshot.create(repository=repository_name,
                           snapshot=snapshot_name, 
                           body={"indices": index_name},
                           params={"wait_for_completion": "true"})
        print("Snapshot created: " + snapshot_name)
    else:
        print("There is no index with name: " + index_name)


def apply_snapshot_from_repository(
    snapshot_name,
    index_name,
    new_index_name,
    repository_name='openartbrowser_index_backup') -> None:
    """
    Applies a snapshot created in an earlier creation from a repository.

    :arg index_name: Name of the index the snapshot should be applied.
    :arg repository_name: Name of the repository the snapshot is in.
    :arg snapshot_name: Name of the snapshot.
    """
    es = Elasticsearch()

    try:
        es.indices.close(index=index_name)
        result = es.snapshot.restore(
            repository=repository_name, 
            snapshot=snapshot_name,
            body={
                "indices" : index_name,
                "rename_pattern" : index_name,
                "rename_replacement": new_index_name
            },
            params={
                "wait_for_completion": "true",
            })
        print(str(result))
    except Exception as e:
        print(str(e))


def delete_snapshot_from_repository(
        snapshot_name,
        repository_name='openartbrowser_index_backup',
        backup_directory='/var/lib/elasticsearch/backup') -> None:
    """
    Delete a snapshot from the repository.

    :arg snapshot_name: Name of the snapshot to be deleted.
    :arg repository_name: Name of the repository the snapshot is in.
    :arg backup_directory: Directory in which the repository is located.
                           See create_snapshot_for_index for more information on that.
    """
    # Increase timeout because deleting snapshots had exceeded the default timeout of 10 seconds
    es = Elasticsearch(timeout=30)

    try:
        # Check if repository already was created
        es.snapshot.get_repository(repository_name)
    except:  # If not create
        es.snapshot.create_repository(repository=repository_name, body={
                                      "type": "fs", "settings": {"location": backup_directory}})
    try:
        es.snapshot.delete(repository=repository_name, 
                           snapshot=snapshot_name,
                           params={
                               "wait_for_completion": "true",
                           })
    except Exception as e:
        print("There was a problem deleting the snapshot:")
        print(str(e))


def list_all_snapshots_from_repository(
        elastic_search_url='localhost:9200',
        repository_name='openartbrowser_index_backup') -> None:
    """
    Lists all created snapshots in a repository.

    :arg elastic_search_url: Url of the ElasticSearch server. The default is 'localhost:9200'.
    :arg repository_name: Name of the repository which contains the snapshots.
    """
    try:
        req = requests.get(url="http://" + elastic_search_url +
                           "/_cat/snapshots/" + repository_name)
        print(req.text)
    except Exception as e:
        print(str(e))


def list_all_indices(elastic_search_url='localhost:9200') -> None:
    """
    List all indices.

    :arg elastic_search_url: Url of the ElasticSearch server. The default is 'localhost:9200'.
    """
    try:
        req = requests.get(url="http://" + elastic_search_url +
                           "/_cat/indices")
        print(req.text)
    except Exception as e:
        print(str(e))


def language_config_to_list(
    config_file=Path(__file__).parent.parent.absolute() /
    "languageconfig.csv"):
    """[Reads languageconfig.csv and returns array that contains its
    full contents]

    Returns:
        [list] -- [contents of languageconfig.csv as list]
    """
    languageValues = []
    with open(config_file, encoding="utf-8") as file:
        configReader = csv.reader(file, delimiter=";")
        for row in configReader:
            if row[0] != "langkey":
                languageValues.append(row)
    return languageValues


def create_index_for_each_language(
    lang_keys=[item[0] for item in language_config_to_list()], 
    filepath=Path(__file__).resolve().parent.parent / "crawler_output") -> None:
    """
    Creates a new index for each language in the languageconfig.csv.
    The new indice name convention is <indexname>_new.

    :arg lang_leys: Languagekeys for which the index has to be created.
    :arg filepath: Location of the art_ontology_*.json language files.
    """
    for key in lang_keys:
        create_index(file=filepath / str("art_ontology_" + key + ".json"),index_name=key + "_new")


def swap_index_for_each_language(lang_keys=[item[0] for item in language_config_to_list()]) -> None:
    """
    Swaps a newly created index (identified by it's name *_new) with the current one.
    The current index is saved to *_old.

    :arg lang_leys: Languagekeys for which the index has to be created.
    """
    for key in lang_keys:
        swap_index(index_name_new=key + "_new", index_name_current=key, index_name_old=key + "_old")


def swap_to_backup_for_each_language(
    lang_keys=[item[0] for item in language_config_to_list()],
    delete_non_working_indices=True) -> None:
    """
    Can be used if the current indices aren't working. This resets the indices to the <languagecode>_old
    indices. The current non working indices can be saved to an index with the restoration date as name.
    This is only possible once because of the renaming of the indices <languagecode>_old to <languagecode>.

    :arg lang_leys: Languagekeys for which the index has to be created.
    :arg delete_non_working_indices: If this is set to True the non working indices will be deleted.
                                     For debugging purposes set to this False.
    """
    es = Elasticsearch()
    for key in lang_keys:
        not_working_index_name = key + time.strftime("%Y%m%d-%H%M%S")
        es.indices.open(key + "_old") # open old index for reapplying
        if swap_index(index_name_new=key + "_old", index_name_current=key,
                   index_name_old=not_working_index_name):
            if(delete_non_working_indices):
                print("The not working index named " + not_working_index_name + " will now be deleted")
                delete_index(not_working_index_name)
            else:
                print("The not working index " + key + " was renamed to " + 
                not_working_index_name + " and can now be debugged")
                print("After debugging deletion is possible with the delete_index function")


def count_check_for_each_language(
    lang_keys=[item[0] for item in language_config_to_list()], 
    filepath=Path(__file__).resolve().parent.parent / "crawler_output") -> bool:
    """
    After the indices were created check that the indice document count 
    equals the JSON object count of the corresponding JSON file. 
    The corresponding JSON file is located within the filepath parameters path.

    :arg lang_leys: Languagekeys for which the check has to be satisfied.
    :arg filepath: Location of the art_ontology_*.json language files.
    """
    es = Elasticsearch()
    for key in lang_keys:
        # Refresh is needed because the indice stats aren't always up-to-date
        es.indices.refresh(key)
        es_document_count_dict = es.cat.count(index=key, params={"format": "json"})
        es_document_count = int(es_document_count_dict[0]["count"])
        file_name = filepath / str("art_ontology_" + key + ".json")
        with open(file_name, encoding='utf-8') as input:
            object_array = json.load(input)
            json_object_count = len(object_array)
            if es_document_count != json_object_count:
                print("There is a problem with the index \"" + key + "\" the json"
                + " object count doesn't equal the document count in the index" + 
                " which should be the case")
            else:
                print("The index " + key + " seems to be created correctly")


if __name__ == "__main__":
    create_index_for_each_language()
    swap_index_for_each_language()
    count_check_for_each_language()

    # This can be used if the newly added indices aren't working 
    # and you want to go back to <languagecode>_old for example
    #swap_to_backup_for_each_language()
