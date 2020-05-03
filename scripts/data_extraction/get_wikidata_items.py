from pathlib import Path
import csv
import datetime
from SPARQLWrapper import SPARQLWrapper, JSON
from urllib.error import HTTPError
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import logging
import sys
from pywikibot import WbTime
import hashlib
import json

DEV = False
DEV_LIMIT = 1  # Not entry but chunks of 50

# All properties extracted from the wikidata entities mapped to their openartbrowser key-label
propertyname_to_property_id = {
    "image": "P18",
    "class": "P31",  # Is called "instance of" in wikidata
    "artist": "P170",  # Is called "creator" in wikidata
    "location": "P276",
    "genre": "P136",
    "movement": "P135",
    "inception": "P571",
    "material": "P186",
    "motif": "P180",  # Is called "depicts" in wikidata
    "country": "P17",
    "height": "P2048",
    "width": "P2049",
    "iconclass": "P1257",
    "main_subject": "P921",
}


def agent_header():
    return "<nowiki>https://cai-artbrowserstaging.fbi.h-da.de/; tilo.w.michel@stud.h-da.de</nowiki>"


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


def query_artwork_qids(type_name, wikidata_id):
    """ Extracts all artwork QIDs from the wikidata SPARQL endpoint https://query.wikidata.org/ """
    artwork_ids_filepath = Path(__file__).parent.absolute() / "artwork_ids_query.sparql"
    QID_BY_ARTWORK_TYPE_QUERY = (
        open(artwork_ids_filepath, "r", encoding="utf8")
        .read()
        .replace("$QID", wikidata_id)
    )

    sparql = SPARQLWrapper("https://query.wikidata.org/sparql", agent=agent_header())

    wikidata_entity_url = "http://www.wikidata.org/entity/"

    sparql.setQuery(QID_BY_ARTWORK_TYPE_QUERY)
    sparql.setReturnFormat(JSON)

    # ToDo: refactor would be better without while True
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
                print("Looks like the bot was blocked.")
                exit(-1)

    artwork_ids = list(
        map(
            lambda result: result["item"]["value"].replace(wikidata_entity_url, ""),
            query_result["results"]["bindings"],
        )
    )
    print(f"{type_name}: {len(artwork_ids)} ids from SPARQL query")

    return artwork_ids


def add_wiki_to_string(s):
    return s + "wiki"


def requests_retry_session(
    retries=3, backoff_factor=0.3, status_forcelist=(500, 502, 504), session=None,
):
    """ Request session with retry possibility
        Source: https://www.peterbe.com/plog/best-practice-with-retries-with-requests
    """
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def wikidata_entity_request(
    qids,
    languageKeys=[item[0] for item in language_config_to_list()],
    props=["claims", "descriptions", "labels", "sitelinks"],
    timeout=5,
    sleep_time=60,
    maxlag=10,
):
    """ Represents one artwork request for n-items
        The API specifies that 50 items can be loaded at once without needing additional permissions:
        https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
    """
    langkeyPlusWikiList = [add_wiki_to_string(key) for key in languageKeys]
    parameters = {
        "action": "wbgetentities",
        "ids": "|".join(qids),
        "format": "json",
        "languages": "|".join(languageKeys),
        "sitefilter": "|".join(langkeyPlusWikiList),
        "props": "|".join(props),
        # if the server needs more than maxlag seconds to process
        # the query an error response is returned
        "maxlag": maxlag,
    }
    header = {"Content-Type": "application/json", "user_agent": agent_header()}
    while True:
        try:
            t0 = time.time()
            response = requests_retry_session().get(
                "https://www.wikidata.org/w/api.php",
                params=parameters,
                headers=header,
                timeout=timeout,
            )
            logging.info(f"Response received {response.status_code}")
            if response.status_code == 403:
                logging.error(
                    f"The server forbid the query. Ending Crawl at {datetime.datetime.now()}. Error: {response.status_code}"
                )
                exit(-1)
            response = response.json()
            if "error" in response:
                logging.warning(
                    f"The maxlag of the server exceeded ({maxlag} seconds) waiting a minute before retry. Response: {response}"
                )
                time.sleep(sleep_time)
                # retry
                continue
        except HTTPError as http_error:
            logging.error(
                f"Request error. Time: {datetime.datetime.now()}. HTTP-Error: {http_error}. Following items couldn't be loaded: {qids}"
            )
        except Exception as error:
            print(
                f"Unknown error. Time: {datetime.datetime.now()}. Error: {error}. Following items couldn't be loaded: {qids}"
            )
        finally:
            t1 = time.time()
            logging.info(f"The request took {t1 - t0} seconds")
            break

    return response


def get_image_url_by_name(image_name) -> str:
    image_name = image_name.replace(" ", "_")
    hash = hashlib.md5(image_name.encode("utf-8")).hexdigest()
    hash_index_1 = hash[0]
    hash_index_1_and_2 = hash[0] + hash[1]
    url = "https://upload.wikimedia.org/wikipedia/commons/{0}/{1}/{2}".format(
        hash_index_1, hash_index_1_and_2, image_name
    )
    return url


def try_get_label_or_description(entity_dict, fieldname, langkey):
    """ Method to extract the label or description """
    try:
        return entity_dict[fieldname][langkey]["value"]
    except Exception as error:
        logging.info(
            "Error on item {0}, property {1}, error {2}".format(
                entity_dict["id"], fieldname, error
            )
        )
        return ""


def try_get_dimensions(entity_dict, property_id):
    try:
        return entity_dict["claims"][property_id][0]["mainsnak"]["datavalue"]["value"][
            "amount"
        ]
    except Exception as error:
        logging.info(
            "Error on item {0}, property {1}, error {2}".format(
                entity_dict["id"], property_id, error
            )
        )
        return ""


def try_get_qid_reference_list(entity_dict, property_id):
    """ Method to extract the references (which are qids) as a list """
    try:
        return list(
            map(
                lambda clm: clm["mainsnak"]["datavalue"]["value"]["id"],
                entity_dict["claims"][property_id],
            )
        )
    except Exception as error:
        logging.info(
            "Error on item {0}, property {1}, error {2}".format(
                entity_dict["id"], property_id, error
            )
        )
        return []


def try_get_value_list(entity_dict, property_id):
    """ Method to extract iconclasses """
    try:
        return list(
            map(
                lambda clm: clm["mainsnak"]["datavalue"]["value"],
                entity_dict["claims"][property_id],
            )
        )
    except Exception as error:
        logging.info(
            "Error on item {0}, property {1}, error {2}".format(
                entity_dict["id"], property_id, error
            )
        )
        return []


def try_get_year_from_inception_timestamp(entity_dict, property_id):
    """ Method to extract the year from an inception timestamp """
    try:
        timestr = entity_dict["claims"][property_id][0]["mainsnak"]["datavalue"][
            "value"
        ]["time"]
        return WbTime.fromTimestr(timestr).year
    except Exception as error:
        logging.info(
            "Error on item {0}, property {1}, error {2}".format(
                entity_dict["id"], property_id, error
            )
        )
        return ""


def try_get_first_qid(entity_dict, property_id):
    """ Method to extract the country id """
    try:
        # ToDo: resolve to label or load all country qids load them seperate and do this later
        country = entity_dict["claims"][property_id][0]["mainsnak"]["datavalue"][
            "value"
        ]["id"]
        return country
    except Exception as error:
        logging.info("Error: {0}".format(error))
        return ""


def try_get_wikipedia_link(entity_dict, langkey):
    try:
        return "https://{0}.wikipedia.org/wiki/{1}".format(
            langkey,
            entity_dict["sitelinks"][f"{langkey}wiki"]["title"].replace(" ", "_"),
        )
    except:
        return ""


def extract_artworks(
    type_name,
    wikidata_id,
    already_crawled_wikidata_items,
    languageKeys=[item[0] for item in language_config_to_list()],
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
    logging.basicConfig(
        filename="extract_artworks.log", filemode="w", level=logging.DEBUG
    )

    extract_dicts = []
    chunk_count = 0
    item_count = 0
    artwork_ids = query_artwork_qids(type_name, wikidata_id)

    # Don't load items again, if they were loaded in another artwork category
    for artwork_id in artwork_ids:
        if artwork_id in already_crawled_wikidata_items:
            artwork_ids.remove(artwork_id)

    print(
        f"{len(artwork_ids)} {type_name} entries are not loaded yet, starting now. Already crawled item count is {len(already_crawled_wikidata_items)}"
    )
    chunk_size = 50  # The chunksize 50 is allowed by the wikidata api, bigger numbers need special permissions
    artwork_id_chunks = chunks(artwork_ids, chunk_size)
    for chunk in artwork_id_chunks:
        if DEV and chunk_count == DEV_LIMIT:
            logging.debug(
                f"DEV_LIMIT of {type_name} reached. End extraction for {type_name}"
            )
            break

        query_result = wikidata_entity_request(chunk)
        if "entities" not in query_result:
            logging.warn("Skipping chunk")
            continue

        for result in query_result["entities"].values():
            try:
                qid = result["id"]
                # How to get image url
                # https://stackoverflow.com/questions/34393884/how-to-get-image-url-property-from-wikidata-item-by-api
                image = get_image_url_by_name(
                    result["claims"][propertyname_to_property_id["image"]][0][
                        "mainsnak"
                    ]["datavalue"]["value"]
                )
            except Exception as error:
                logging.warning(
                    "Error on qid or image, skipping item. Error: {0}".format(error)
                )
                continue

            label = try_get_label_or_description(result, "labels", "en")
            description = try_get_label_or_description(result, "descriptions", "en")
            classes = try_get_qid_reference_list(
                result, propertyname_to_property_id["class"]
            )
            artists = try_get_qid_reference_list(
                result, propertyname_to_property_id["artist"]
            )
            locations = try_get_qid_reference_list(
                result, propertyname_to_property_id["location"]
            )
            genres = try_get_qid_reference_list(
                result, propertyname_to_property_id["genre"]
            )
            movements = try_get_qid_reference_list(
                result, propertyname_to_property_id["movement"]
            )
            materials = try_get_qid_reference_list(
                result, propertyname_to_property_id["material"]
            )
            motifs = try_get_qid_reference_list(
                result, propertyname_to_property_id["motif"]
            )
            iconclasses = try_get_value_list(
                result, propertyname_to_property_id["iconclass"]
            )
            inception = try_get_year_from_inception_timestamp(
                result, propertyname_to_property_id["inception"]
            )
            country = try_get_first_qid(result, propertyname_to_property_id["country"])
            height = try_get_dimensions(result, propertyname_to_property_id["height"])
            width = try_get_dimensions(result, propertyname_to_property_id["width"])
            main_subjects = try_get_qid_reference_list(
                result, propertyname_to_property_id["main_subject"]
            )

            artwork_dictionary = {
                "id": qid,
                "classes": classes,
                "label": label,
                "description": description,
                "image": image,
                "artists": artists,
                "locations": locations,
                "genres": genres,
                "movements": movements,
                "inception": inception,
                "materials": materials,
                "motifs": motifs,
                "country": country,
                "height": height,
                "width": width,
                "iconclasses": iconclasses,
                "main_subjects": main_subjects,
            }

            for langkey in languageKeys:
                label_lang = try_get_label_or_description(result, "labels", langkey)
                description_lang = try_get_label_or_description(
                    result, "descriptions", langkey
                )
                wikipedia_link_lang = try_get_wikipedia_link(result, langkey)
                artwork_dictionary.update(
                    {
                        "label_" + langkey: label_lang,
                        "description_" + langkey: description_lang,
                        "wikipediaLink_" + langkey: wikipedia_link_lang,
                    }
                )
            extract_dicts.append(artwork_dictionary)
            already_crawled_wikidata_items.add(qid)

        item_count += len(chunk)
        print(f"Status of {type_name}: {item_count}/{len(artwork_ids)}")

        chunk_count += 1

    print(datetime.datetime.now(), "Finished with", type_name)
    return extract_dicts


def extract_art_ontology():
    """ Extracts *.csv and *.JSON files for artworks from Wikidata """

    # Array of already crawled wikidata items
    already_crawled_wikidata_items = set()

    for artwork, wd in [
        ("drawings", "wd:Q93184"),
        ("sculptures", "wd:Q860861"),
        ("paintings", "wd:Q3305213"),
    ]:
        extracted_artwork = extract_artworks(
            artwork, wd, already_crawled_wikidata_items
        )

        filename = (
            Path.cwd()
            / "crawler_output"
            / "intermediate_files"
            / "csv"
            / "artworks"
            / artwork
        )
        generate_csv(artwork, extracted_artwork, get_fields(artwork), filename)

        filename = (
            Path.cwd()
            / "crawler_output"
            / "intermediate_files"
            / "json"
            / "artworks"
            / artwork
        )
        generate_json(artwork, extracted_artwork, filename)

    artworks = "artworks"
    merged_artworks = merge_artworks()

    filename = Path.cwd() / "crawler_output" / "intermediate_files" / "csv" / artworks
    generate_csv(artworks, merged_artworks, get_fields(artworks) + ["type"], filename)

    filename = Path.cwd() / "crawler_output" / "intermediate_files" / "json" / artworks
    # TODO refactor ab hier

    # Get motifs and main subjects
    motifs = get_distinct_attribute_values_from_artworks("motifs", merged_artworks)

    main_subjects = get_distinct_attribute_values_from_artworks(
        "motifs", merged_artworks
    )
    motifs_and_main_subjects = motifs
    for main_subject in main_subjects:
        if main_subject not in motifs:
            motifs_and_main_subjects.add(main_subjects)
    motifs_extracted = get_subject("motifs and main subjects", motifs_and_main_subjects)
    filename = Path.cwd() / "crawler_output" / "intermediate_files" / "json" / "motifs"
    generate_json("motif", motifs_extracted, filename)

    # Get genres, materials and country labels
    genres = get_distinct_attribute_values_from_artworks("genres", merged_artworks)
    genres_extracted = get_subject("genres", genres)
    filename = Path.cwd() / "crawler_output" / "intermediate_files" / "json" / "genres"
    generate_json("genres", genres_extracted, filename)

    materials = get_distinct_attribute_values_from_artworks(
        "materials", merged_artworks
    )
    materials_extracted = get_subject("materials", materials)
    filename = (
        Path.cwd() / "crawler_output" / "intermediate_files" / "json" / "materials"
    )
    generate_json("materials", materials_extracted, filename)

    distinct_country_ids = get_distinct_attribute_values_from_artworks(
        "country", merged_artworks, True
    )
    country_labels_extracted = get_country_labels(distinct_country_ids)
    merged_artworks = resolve_country_id_to_label(
        merged_artworks, country_labels_extracted
    )

    # Write to artworks.json
    filename = (
        Path.cwd() / "crawler_output" / "intermediate_files" / "json" / "artworks"
    )
    generate_json(artworks, merged_artworks, filename)


def get_fields(type_name, languageKeys=[item[0] for item in language_config_to_list()]):
    """ Returns all fields / columns for a specific type, e. g. 'artworks' """
    fields = ["id", "classes", "label", "description", "image"]
    for langkey in languageKeys:
        fields += [
            "label_" + langkey,
            "description_" + langkey,
            "wikipediaLink_" + langkey,
        ]
    if type_name in ["drawings", "sculptures", "paintings", "artworks"]:
        fields += [
            "artists",
            "locations",
            "genres",
            "movements",
            "inception",
            "materials",
            "motifs",
            "country",
            "height",
            "width",
            "iconclasses",
            "main_subjects",
        ]
        for langkey in languageKeys:
            fields += ["country_" + langkey]
    elif type_name == "artists":
        fields += [
            "gender",
            "date_of_birth",
            "date_of_death",
            "place_of_birth",
            "place_of_death",
            "citizenship",
            "movements",
            "influenced_by",
        ]
        for langkey in languageKeys:
            fields += ["gender_" + langkey, "citizenship_" + langkey]
    elif type_name == "movements":
        fields += ["influenced_by"]
    elif type_name == "locations":
        fields += ["country", "website", "part_of", "lat", "lon"]
        for langkey in languageKeys:
            fields += ["country_" + langkey]
    elif type_name == "classes":
        fields = ["id", "label", "description", "subclass_of"]
        for langkey in languageKeys:
            fields += ["label_" + langkey, "description_" + langkey]
    return fields


def generate_csv(name, extract_dicts, fields, filename):
    """ Generates a csv file from a dictionary """
    filename.parent.mkdir(parents=True, exist_ok=True)
    with open(filename.with_suffix(".csv"), "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fields, delimiter=";", quotechar='"')
        writer.writeheader()
        for extract_dict in extract_dicts:
            writer.writerow(extract_dict)


def generate_json(name, extract_dicts, filename):
    """ Generates a JSON file from a dictionary """
    if len(extract_dicts) == 0:
        return
    filename.parent.mkdir(parents=True, exist_ok=True)
    with open(filename.with_suffix(".json"), "w", newline="", encoding="utf-8") as file:
        arrayToDump = []
        for extract_dict in extract_dicts:
            extract_dict["type"] = name
            arrayToDump.append(extract_dict)
        file.write(json.dumps(arrayToDump, ensure_ascii=False))


def merge_artworks():
    """ Merges artworks from files 'paintings.json', 'drawings.json',
        'sculptures.json' (function extract_artworks) and
        stores them in a dictionary.
    """
    print(datetime.datetime.now(), "Starting with", "merging artworks")
    artworks = set()
    file_names = ["paintings.json", "drawings.json", "sculptures.json"]
    file_names = [
        Path.cwd()
        / "crawler_output"
        / "intermediate_files"
        / "json"
        / "artworks"
        / file_name
        for file_name in file_names
    ]
    extract_dicts = []

    for file_name in file_names:
        with open(file_name, encoding="utf-8") as input:
            object_array = json.load(input)
            for object in object_array:
                if not object["id"] in artworks:  # remove duplicates
                    object["type"] = "artwork"
                    extract_dicts.append(object)
                    artworks.add(object["id"])

    print(datetime.datetime.now(), "Finished with", "merging artworks")
    print()
    return extract_dicts


def get_distinct_attribute_values_from_artworks(
    attribute_name, entry_dict, is_single_value_column=False
):
    attribute_set = set()
    for json_object in entry_dict:
        if is_single_value_column:
            value = json_object[attribute_name]
            if value != "":
                attribute_set.add(value)
        else:
            for values in json_object[attribute_name]:
                attribute_set.add(values)

    return attribute_set


def get_subject(
    type_name, qids, languageKeys=[item[0] for item in language_config_to_list()]
):
    print(datetime.datetime.now(), f"Starting with {type_name}")
    print(f"Total {type_name} to extract: {len(qids)}")
    item_count = 0
    extract_dicts = []
    chunk_size = 50  # The chunksize 50 is allowed by the wikidata api, bigger numbers need special permissions
    motif_id_chunks = chunks(list(qids), chunk_size)
    for chunk in motif_id_chunks:
        query_result = wikidata_entity_request(chunk)

        if "entities" not in query_result:
            logging.warn("Skipping chunk")
            continue

        for result in query_result["entities"].values():
            try:
                qid = result["id"]
            except Exception as error:
                logging.warning("Error on qid, skipping item. Error: {0}".format(error))
                continue

            # ToDo: Extract to function
            # How to get image url
            # https://stackoverflow.com/questions/34393884/how-to-get-image-url-property-from-wikidata-item-by-api
            try:
                image = get_image_url_by_name(
                    result["claims"][propertyname_to_property_id["image"]][0][
                        "mainsnak"
                    ]["datavalue"]["value"]
                )
            except:
                image = ""
            label = try_get_label_or_description(result, "labels", "en")
            description = try_get_label_or_description(result, "descriptions", "en")
            classes = try_get_qid_reference_list(
                result, propertyname_to_property_id["class"]
            )

            subject_dict = {
                "id": qid,
                "classes": classes,
                "label": label,
                "description": description,
                "image": image,
            }

            for langkey in languageKeys:
                label_lang = try_get_label_or_description(result, "labels", langkey)
                description_lang = try_get_label_or_description(
                    result, "descriptions", langkey
                )
                wikipedia_link_lang = try_get_wikipedia_link(result, langkey)
                subject_dict.update(
                    {
                        "label_" + langkey: label_lang,
                        "description_" + langkey: description_lang,
                        "wikipediaLink_" + langkey: wikipedia_link_lang,
                    }
                )
            extract_dicts.append(subject_dict)

        item_count += len(chunk)
        print(f"Status of {type_name}: {item_count}/{len(qids)}")

    print(datetime.datetime.now(), f"Finished with {type_name}")
    return extract_dicts


def get_country_labels(
    qids, languageKeys=[item[0] for item in language_config_to_list()]
):
    print(datetime.datetime.now(), "Starting with motifs and main_subjects")
    print(f"Total country labels to extract: {len(qids)}")
    item_count = 0
    extract_dicts = []
    chunk_size = 50  # The chunksize 50 is allowed by the wikidata api, bigger numbers need special permissions
    country_id_chunks = chunks(list(qids), chunk_size)
    for chunk in country_id_chunks:
        query_result = wikidata_entity_request(
            chunk, props=["labels"], timeout=10
        )  # country entities take longer so timeout is increased

        if "entities" not in query_result:
            logging.warn("Skipping chunk")
            continue

        for result in query_result["entities"].values():
            try:
                qid = result["id"]
            except Exception as error:
                logging.warning("Error on qid, skipping item. Error: {0}".format(error))
                continue

            label = try_get_label_or_description(result, "labels", "en")
            subject_dict = {
                "id": qid,
                "label": label,
            }

            for langkey in languageKeys:
                label_lang = try_get_label_or_description(result, "labels", langkey)
                subject_dict.update({"label_" + langkey: label_lang})
            extract_dicts.append(subject_dict)

        item_count += len(chunk)
        print(f"Status of countries (labels only): {item_count}/{len(qids)}")

    print(datetime.datetime.now(), "Finished with country labels")
    return extract_dicts


def resolve_country_id_to_label(
    artwork_dict,
    country_labels,
    languageKeys=[item[0] for item in language_config_to_list()],
):
    # country_labels objects to qid_country_labels_dict
    qid_country_labels_dict = {}
    for country_label_obj in country_labels:
        qid_country_labels_dict[country_label_obj["id"]] = country_label_obj

    for artwork_object in artwork_dict:
        if artwork_object["country"] != "":
            property_id = artwork_object["country"]
            artwork_object["country"] = qid_country_labels_dict[property_id]["label_en"]
            for langkey in languageKeys:
                artwork_object[f"country_{langkey}"] = qid_country_labels_dict[
                    property_id
                ][f"label_{langkey}"]
        else:
            for langkey in languageKeys:
                artwork_object[f"country_{langkey}"] = ""

    return artwork_dict


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "-d":
        if len(sys.argv) > 2 and sys.argv[2].isdigit():
            DEV_LIMIT = int(sys.argv[2])
    print("DEV MODE: on, DEV_LIM={0}".format(DEV_LIMIT))
    DEV = True

    logging.debug("Extracting Art Ontology")
    extract_art_ontology()
