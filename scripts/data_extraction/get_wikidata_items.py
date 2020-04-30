from pathlib import Path
import csv
import datetime
from SPARQLWrapper import SPARQLWrapper, JSON
from urllib.error import HTTPError
import time
import requests
import logging
from pywikibot import WbTime
import hashlib


def agent_header():
    return "<nowiki>https://cai-artbrowserstaging.fbi.h-da.de/</nowiki>; tilo.w.michel@stud.h-da.de"


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


def artwork_qids(type_name, wikidata_id):
    """ Extracts all artwork QIDs and returns them in chunks of 50 for the API call """
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
                print("Looks like the bot was blocked.")
                exit(-1)

    artwork_ids = list(
        map(
            lambda result: result["item"]["value"].replace(wikidata_entity_url, ""),
            query_result["results"]["bindings"],
        )
    )
    print(f"{type_name}: {len(artwork_ids)} entries")

    return chunks(artwork_ids, 50)


def list_to_pipe_seperated_string(l):
    return "|".join(l)


def add_wiki_to_string(s):
    return s + "wiki"


def artworks_request(
    qids,
    languageKeys=[item[0] for item in language_config_to_list()],
    props=["claims", "descriptions", "labels", "sitelinks"],
):
    """ Represents one artwork request for n-items
        The API specifies that 50 items can be loaded at once without needing additional permissions:
        https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
    """
    langkeyPlusWikiList = [add_wiki_to_string(key) for key in languageKeys]
    parameters = {
        "action": "wbgetentities",
        "ids": list_to_pipe_seperated_string(qids),
        "format": "json",
        "languages": list_to_pipe_seperated_string(languageKeys),
        "sitefilter": list_to_pipe_seperated_string(langkeyPlusWikiList),
        #'maxlag': 5
    }
    header = {"Content-Type": "application/json", "user_agent": agent_header()}
    response = requests.get(
        "https://www.wikidata.org/w/api.php", params=parameters, headers=header
    )
    return response.json()


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
        return int(
            entity_dict["claims"][property_id]["mainsnak"]["datavalue"]["value"][
                "amount"
            ]
        )
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


def try_get_first_country_id(entity_dict, property_id):
    """ Method to extract the country id """
    try:
        # ToDo: resolve to label or load all country qids load them seperate and do this later
        country = entity_dict["claims"][property_id][0]["mainsnak"]
        return country
    except Exception as error:
        logging.info("Error: {0}".format(error))
        return ""


def try_get_wikipedia_link(entity_dict, langkey):
    try:
        sitelinks = entity_dict["sitelinks"]
        return "wikpedia_page.full_url()"
    except:
        return ""


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
    logging.basicConfig(
        filename="extract_artworks.log", filemode="w", level=logging.DEBUG
    )
    # All properties extracted from the artworks mapped to their label
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

    query_results = []
    extract_dicts = []

    for chunk in artwork_qids(type_name, wikidata_id):
        while True:
            try:
                query_result = artworks_request(chunk)
            except HTTPError as http_error:
                print("HTTP error: {0}".format(http_error))
                print("Waiting for 5 seconds")
                time.sleep(5)
                if error.errno != 403:
                    continue
                else:
                    ("Error was fatal. Ending Crawl at ", datetime.datetime.now())
                    exit(-1)
            except Exception as error:
                print("Unknown error: {0}".format(error))
            else:
                break

        query_results.extend(query_result)
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
            iconclasses = try_get_qid_reference_list(
                result, propertyname_to_property_id["iconclass"]
            )
            inception = try_get_year_from_inception_timestamp(
                result, propertyname_to_property_id["inception"]
            )
            country = try_get_first_country_id(
                result, propertyname_to_property_id["country"]
            )
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

            print(artwork_dictionary)

    print(datetime.datetime.now(), "Finished with", type_name)


extract_artworks("paintings", "wd:Q3305213")
