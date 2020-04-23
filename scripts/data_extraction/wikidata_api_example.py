from pathlib import Path
import csv
import datetime
from SPARQLWrapper import SPARQLWrapper, JSON
import pandas as pd
from string import Template
from urllib.error import HTTPError
import time


def language_config_to_list(
    config_file=Path(__file__).parent.parent.absolute() / "languageconfig.csv",
):
    """Reads languageconfig.csv and returns array that contains its
    full contents

    Returns:
        list -- contents of languageconfig.csv as list
    """
    languageValues = []
    with open(config_file, encoding="utf-8") as file:
        configReader = csv.reader(file, delimiter=";")
        for row in configReader:
            if row[0] != "langkey":
                languageValues.append(row)
    return languageValues


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def extract_artworks(
    type_name, wikidata_id, languageKeys=[item[0] for item in language_config_to_list()]
):
    """Extracts artworks metadata from Wikidata and stores them in a dictionary.

    type_name -- e.g., 'drawings', will be used as filename
    wikidata_id -- e.g., 'wd:Q93184' Wikidata ID of a class; all instances of this class and all subclasses with label, artist, and image will be loaded.
    languageKeys -- e.g, list('en', 'de')

    Examples:
    extract_artworks('drawings', 'wd:Q93184', '('en', 'de'))
    extract_artworks('sculptures', 'wd:Q860861', '('en', 'de'))
    extract_artworks('paintings', 'wd:Q3305213', '('en', 'de'))
    """
    print(datetime.datetime.now(), "Starting with", type_name)

    artworks_property_ids = {
        "image": "P18",
    }

    artwork_ids_filepath = Path(__file__).parent.absolute() / "artwork_ids_query.sparql"
    QID_BY_ARTWORK_TYPE_QUERY = (
        open(artwork_ids_filepath, "r", encoding="utf8")
        .read()
        .replace("$QID", wikidata_id)
    )

    sparql = SPARQLWrapper(
        "https://query.wikidata.org/sparql", agent="Artworks query test"
    )

    wikidata_entity_url = "http://www.wikidata.org/entity/"

    sparql.setQuery(QID_BY_ARTWORK_TYPE_QUERY)
    sparql.setReturnFormat(JSON)
    while True:
        try:
            query_result = sparql.query().convert()
            break
        except HTTPError as error:
            print(error)
            print("Waiting for 5 seconds")
            time.sleep(5)
            if error.errno != 403:
                continue
            else:
                exit(-1)

    artwork_ids = list(
        map(
            lambda result: result["item"]["value"].replace(wikidata_entity_url, "wd:"),
            query_result["results"]["bindings"],
        )
    )
    print(f"{type_name}: {len(artwork_ids)} entries")

    artwork_ids_chunks = chunks(artwork_ids, 50)  # chunks of 50 ids
    print(artwork_ids_chunks)

    query_results = []

    for chunk in artwork_ids_chunks:
        artwork_query_filepath = (
            Path(__file__).parent.absolute() / "artwork_query.sparql"
        )

        ARTWORK_ATTRIBUTE_QUERY = (
            open(artwork_query_filepath, "r", encoding="utf8")
            .read()
            .replace("$QIDS", ",".join(chunk))
        )
        sparql.setQuery(ARTWORK_ATTRIBUTE_QUERY)
        sparql.setReturnFormat(JSON)
        while True:
            try:
                query_result = sparql.query().convert()["results"]["bindings"]
                break
            except HTTPError as error:
                print(error)
                print("Waiting for 5 seconds")
                time.sleep(5)
                if error.errno != 403:
                    continue
                else:
                    ("Error was fatal. Ending Crawl at ", datetime.datetime.now())
                    exit(-1)
        query_results.extend(query_result)

    # Get PageIds from URL https://en.wikipedia.org/w/api.php?action=query&titles=Mona_Lisa|The_Starry_Night
    # Get Extracts from PageId https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&pageids=70889|1115370

    print(datetime.datetime.now(), "Finished with", type_name)


extract_artworks("paintings", "wd:Q3305213", list("en"))
