import csv
import datetime
import hashlib
import inspect
import json
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError

from data_extraction.constants import *
from data_extraction.request_utils import send_http_request
from pywikibot import WbTime
from shared.utils import chunks, create_new_path, language_config_to_list, setup_logger
from SPARQLWrapper import JSON, SPARQLWrapper

DEV = True
DEV_CHUNK_LIMIT = 2  # Not entry but chunks of 50

logger = setup_logger(
    "data_extraction.get_wikidata_items",
    Path(__file__).parent.parent.absolute() / "logs" / GET_WIKIDATA_ITEMS_LOG_FILENAME,
)


def query_artwork_qids(type_name, wikidata_id):
    """ Extracts all artwork QIDs from the wikidata SPARQL endpoint https://query.wikidata.org/ """
    artwork_ids_filepath = Path(__file__).parent.absolute() / ARTWORK_IDS_QUERY_FILENAME
    QID_BY_ARTWORK_TYPE_QUERY = (
        open(artwork_ids_filepath, "r", encoding="utf8")
        .read()
        .replace("$QID", wikidata_id)
    )

    sparql = SPARQLWrapper(WIKIDATA_SPARQL_URL, agent=AGENT_HEADER)

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
            lambda result: result["item"][VALUE].replace(WIKIDATA_ENTITY_URL, ""),
            query_result["results"]["bindings"],
        )
    )
    print(f"{type_name}: {len(artwork_ids)} ids from SPARQL query")

    return artwork_ids


def wikidata_entity_request(
    qids,
    languageKeys=[item[0] for item in language_config_to_list()],
    props=[CLAIMS, DESCRIPTION[PLURAL], LABEL[PLURAL], SITELINKS],
    timeout=TIMEOUT,
    sleep_time=SLEEP_TIME,
    maxlag=MAX_LAG,
):
    """ Represents one artwork request for n-items
        The API specifies that 50 items can be loaded at once without needing additional permissions:
        https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
    """
    initial_timeout = timeout
    langkeyPlusWikiList = [key + "wiki" for key in languageKeys]
    parameters = {
        "action": "wbgetentities",
        "ids": "|".join(qids),
        "format": JSON,
        "languages": "|".join(languageKeys),
        "sitefilter": "|".join(langkeyPlusWikiList),
        "props": "|".join(props),
        # if the server needs more than maxlag seconds to process
        # the query an error response is returned
        "maxlag": maxlag,
    }

    url = WIKIDATA_API_URL
    return send_http_request(
        parameters,
        HTTP_HEADER,
        url,
        logger,
        initial_timeout=initial_timeout,
        items=qids,
        timeout=timeout,
        sleep_time=sleep_time,
        maxlag=maxlag,
    )


def get_image_url_by_name(image_name) -> str:
    image_name = image_name.replace(" ", "_")
    hash = hashlib.md5(image_name.encode("utf-8")).hexdigest()
    hash_index_1 = hash[0]
    hash_index_1_and_2 = hash[0] + hash[1]
    url = "https://upload.wikimedia.org/wikipedia/commons/{0}/{1}/{2}".format(
        hash_index_1, hash_index_1_and_2, image_name
    )
    return url


def return_on_failure(return_value):
    """
    A decorator that wraps the passed in function and logs
    exceptions should one occur

    @param return_value: The return value of func in case of an exception
    """

    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as error:
                error_message = "Error in function {0} on item {1}".format(
                    func.__name__, args[0][ID]
                )
                # iterate over argument names
                # splice the array to skip the first argument and start at index 1
                for index, param in enumerate(inspect.getfullargspec(func)[0][1:], 1):
                    error_message += ", {0} {1}".format(param, args[index])
                error_message += ", error {0}".format(error)
                logger.info(error_message)

                return return_value

        return wrapper

    return decorator


@return_on_failure("")
def try_get_label_or_description(entity_dict, fieldname, langkey):
    """ Method to extract the label or description """
    return entity_dict[fieldname][langkey][VALUE]


@return_on_failure("")
def try_get_wikipedia_link(entity_dict, langkey):
    return "https://{0}.wikipedia.org/wiki/{1}".format(
        langkey, entity_dict[SITELINKS][f"{langkey}wiki"]["title"].replace(" ", "_"),
    )


@return_on_failure("")
def try_get_dimension_value(entity_dict, property_id):
    return float(
        entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][AMOUNT]
    )


@return_on_failure("")
def try_get_dimension_unit(entity_dict, property_id):
    unit_qid = entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][
        UNIT
    ].replace(WIKIDATA_ENTITY_URL, "")
    is_qid = re.match(QID_PATTERN, unit_qid)
    if is_qid:
        return unit_qid
    else:
        logger.error(
            "Error on item {0}, property {1}, Unit was provided but isn't a QID reference".format(
                entity_dict[ID], property_id
            )
        )
        return ""


@return_on_failure([])
def try_get_qid_reference_list(entity_dict, property_id):
    """ Method to extract the references (which are qids) as a list """
    return list(
        map(
            lambda clm: clm[MAINSNAK][DATAVALUE][VALUE][ID],
            entity_dict[CLAIMS][property_id],
        )
    )


@return_on_failure("")
def try_get_first_value(entity_dict, property_id):
    return entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE]


@return_on_failure([])
def try_get_value_list(entity_dict, property_id):
    """ Method to extract iconclasses """
    return list(
        map(
            lambda clm: clm[MAINSNAK][DATAVALUE][VALUE],
            entity_dict[CLAIMS][property_id],
        )
    )


@return_on_failure("")
def try_get_year_from_property_timestamp(entity_dict, property_id):
    """ Method to extract the year from an inception timestamp """
    timestr = entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][TIME]
    return WbTime.fromTimestr(timestr).year


@return_on_failure("")
def try_get_first_qid(entity_dict, property_id):
    """ Method to extract the first qid """
    return entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][ID]


@return_on_failure("no unit")
def try_get_unit_symbol(entity_dict, property_id):
    unit_symbol_entries = entity_dict[CLAIMS][property_id]
    for unit_symbol_entry in unit_symbol_entries:
        if unit_symbol_entry[MAINSNAK][DATAVALUE][VALUE]["language"] == EN:
            return unit_symbol_entry[MAINSNAK][DATAVALUE][VALUE]["text"]


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
        if DEV and chunk_count == DEV_CHUNK_LIMIT:
            logger.info(
                f"DEV_CHUNK_LIMIT of {type_name} reached. End extraction for {type_name}"
            )
            break

        query_result = wikidata_entity_request(chunk)
        if ENTITIES not in query_result:
            logger.error("Skipping chunk")
            continue

        for result in query_result[ENTITIES].values():
            try:
                qid = result[ID]
                # How to get image url
                # https://stackoverflow.com/questions/34393884/how-to-get-image-url-property-from-wikidata-item-by-api
                image = get_image_url_by_name(
                    result[CLAIMS][PROPERTY_NAME_TO_PROPERTY_ID[IMAGE]][0][MAINSNAK][
                        DATAVALUE
                    ][VALUE]
                )
            except Exception as error:
                logger.error(
                    "Error on qid or image, skipping item. Error: {0}".format(error)
                )
                continue

            label = try_get_label_or_description(result, LABEL[PLURAL], EN)
            description = try_get_label_or_description(result, DESCRIPTION[PLURAL], EN)

            (
                classes,
                artists,
                locations,
                genres,
                movements,
                materials,
                motifs,
                main_subjects,
            ) = get_attribute_values_with_try_get_func(
                result,
                [
                    CLASS[SINGULAR],
                    ARTIST[SINGULAR],
                    LOCATION[SINGULAR],
                    GENRE[SINGULAR],
                    MOVEMENT[SINGULAR],
                    MATERIAL[SINGULAR],
                    MOTIF[SINGULAR],
                    MAIN_SUBJECT[SINGULAR],
                ],
                try_get_qid_reference_list,
            )

            iconclasses = try_get_value_list(
                result, PROPERTY_NAME_TO_PROPERTY_ID[ICONCLASS[SINGULAR]]
            )
            inception = try_get_year_from_property_timestamp(
                result, PROPERTY_NAME_TO_PROPERTY_ID[INCEPTION]
            )
            country = try_get_first_qid(result, PROPERTY_NAME_TO_PROPERTY_ID[COUNTRY])

            # Resolve dimensions
            # The units are qids which have to be resolved later
            height, width, length, diameter = get_attribute_values_with_try_get_func(
                result, [HEIGHT, WIDTH, LENGTH, DIAMETER], try_get_dimension_value,
            )
            (
                height_unit,
                width_unit,
                length_unit,
                diameter_unit,
            ) = get_attribute_values_with_try_get_func(
                result, [HEIGHT, WIDTH, LENGTH, DIAMETER], try_get_dimension_unit,
            )

            artwork_dictionary = {
                ID: qid,
                CLASS[PLURAL]: classes,
                LABEL[SINGULAR]: label,
                DESCRIPTION[SINGULAR]: description,
                IMAGE: image,
                ARTIST[PLURAL]: artists,
                LOCATION[PLURAL]: locations,
                GENRE[PLURAL]: genres,
                MOVEMENT[PLURAL]: movements,
                INCEPTION: inception,
                MATERIAL[PLURAL]: materials,
                MOTIF[PLURAL]: motifs,
                COUNTRY: country,
                HEIGHT: height,
                HEIGHT_UNIT: height_unit,
                WIDTH: width,
                WIDTH_UNIT: width_unit,
                LENGTH: length,
                LENGTH_UNIT: length_unit,
                DIAMETER: diameter,
                DIAMETER_UNIT: diameter_unit,
                ICONCLASS[PLURAL]: iconclasses,
                MAIN_SUBJECT[PLURAL]: main_subjects,
            }

            for langkey in languageKeys:
                label_lang = try_get_label_or_description(
                    result, LABEL[PLURAL], langkey
                )
                description_lang = try_get_label_or_description(
                    result, DESCRIPTION[PLURAL], langkey
                )
                wikipedia_link_lang = try_get_wikipedia_link(result, langkey)
                artwork_dictionary.update(
                    {
                        f"{LABEL[SINGULAR]}_{langkey}": label_lang,
                        f"{DESCRIPTION[SINGULAR]}_{langkey}": description_lang,
                        f"{WIKIPEDIA_LINK}_{langkey}": wikipedia_link_lang,
                    }
                )
            extract_dicts.append(artwork_dictionary)
            already_crawled_wikidata_items.add(qid)

        item_count += len(chunk)
        print(
            f"Status of {type_name}: {item_count}/{len(artwork_ids)}",
            end="\r",
            flush=True,
        )

        chunk_count += 1

    print(datetime.datetime.now(), "Finished with", type_name)
    return extract_dicts


def get_attribute_values_with_try_get_func(result, item_list, try_get_func):
    for item in item_list:
        yield try_get_func(result, PROPERTY_NAME_TO_PROPERTY_ID[item])


def extract_art_ontology():
    """ Extracts *.csv and *.JSON files for artworks from Wikidata """

    # Array of already crawled wikidata items
    already_crawled_wikidata_items = set()

    for artwork, wd in [
        (DRAWING[PLURAL], DRAWING[ID]),
        (SCULPTURE[PLURAL], SCULPTURE[ID]),
        (PAINTING[PLURAL], PAINTING[ID]),
    ]:
        extracted_artwork = extract_artworks(
            artwork, wd, already_crawled_wikidata_items
        )

        path_name = create_new_path(ARTWORK[PLURAL], artwork, CSV)
        generate_csv(artwork, extracted_artwork, get_fields(artwork), path_name)

        path_name = create_new_path(ARTWORK[PLURAL], artwork, JSON)
        generate_json(artwork, extracted_artwork, path_name)

    merged_artworks = merge_artworks()

    path_name = create_new_path(ARTWORK[PLURAL], file_type=CSV)
    generate_csv(
        ARTWORK[PLURAL],
        merged_artworks,
        get_fields(ARTWORK[PLURAL]) + [TYPE],
        path_name,
    )

    # Get motifs and main subjects
    motifs = extract_motifs_and_main_subjects(merged_artworks)

    # Get extracted genres, materials, etc.
    genres, materials, movements, artists, locations = bundle_extract_data_calls(
        [
            GENRE[PLURAL],
            MATERIAL[PLURAL],
            MOVEMENT[PLURAL],
            ARTIST[PLURAL],
            LOCATION[PLURAL],
        ],
        merged_artworks,
    )

    # Get distinct classes from artworks, motifs, etc.
    extracted_classes = get_distinct_extracted_classes(
        merged_artworks, motifs, genres, materials, movements, artists, locations,
    )

    # Get country labels for merged artworks and locations
    (
        locations,
        merged_artworks,
        movements,
    ) = get_country_labels_for_merged_artworks_and_locations(
        locations, merged_artworks, movements
    )

    # Get labels for artists
    artists = get_labels_for_artists(
        artists, [GENDER, PLACE_OF_BIRTH, PLACE_OF_DEATH, CITIZENSHIP]
    )

    # Get unit symbols from qid for artworks
    distinct_unit_qids = get_unit_symbols_from_qid(merged_artworks)
    unit_symbols = get_unit_symbols(distinct_unit_qids)
    resolve_unit_id_to_unit_symbol(merged_artworks, unit_symbols)

    # Write to JSON
    write_data_to_json(
        motifs,
        genres,
        extracted_classes,
        materials,
        movements,
        locations,
        merged_artworks,
        artists,
    )


def extract_motifs_and_main_subjects(merged_artworks):
    motifs = get_distinct_attribute_values_from_dict(MOTIF[PLURAL], merged_artworks)
    main_subjects = get_distinct_attribute_values_from_dict(
        MAIN_SUBJECT[PLURAL], merged_artworks
    )

    motifs_and_main_subjects = motifs | main_subjects
    motifs = get_subject("motifs and main subjects", motifs_and_main_subjects)
    return motifs


def write_data_to_json(
    motifs,
    genres,
    extracted_classes,
    materials,
    movements,
    locations,
    merged_artworks,
    artists,
):
    generate_json(MOTIF[SINGULAR], motifs, create_new_path(MOTIF[PLURAL]))
    generate_json(GENRE[SINGULAR], genres, create_new_path(GENRE[PLURAL]))
    generate_json(CLASS[SINGULAR], extracted_classes, create_new_path(CLASS[PLURAL]))
    generate_json(MATERIAL[SINGULAR], materials, create_new_path(MATERIAL[PLURAL]))
    generate_json(MOVEMENT[SINGULAR], movements, create_new_path(MOVEMENT[PLURAL]))
    generate_json(LOCATION[SINGULAR], locations, create_new_path(LOCATION[PLURAL]))
    generate_json(ARTWORK[SINGULAR], merged_artworks, create_new_path(ARTWORK[PLURAL]))
    generate_json(ARTIST[SINGULAR], artists, create_new_path(ARTIST[PLURAL]))


def get_unit_symbols_from_qid(merged_artworks):
    distinct_unit_qids = get_distinct_attribute_values_from_dict(
        HEIGHT_UNIT, merged_artworks, True
    )

    for item in [WIDTH_UNIT, LENGTH_UNIT, DIAMETER_UNIT]:
        distinct_unit_qids = distinct_unit_qids.union(
            get_distinct_attribute_values_from_dict(item, merged_artworks, True)
        )
    return distinct_unit_qids


def get_labels_for_artists(artists, prop_list):
    for item in prop_list:
        distinct_label = get_distinct_attribute_values_from_dict(item, artists, True)
        extracted_labels = get_entity_labels(item, distinct_label)
        resolve_entity_id_to_label(item, artists, extracted_labels)
    return artists


def get_distinct_extracted_classes(
    merged_artworks, motifs, genres, materials, movements, artists, locations
):
    distinct_classes = get_distinct_attribute_values_from_dict(
        CLASS[PLURAL], merged_artworks
    )
    distinct_classes = bundle_class_union_calls(
        distinct_classes, [motifs, genres, materials, movements, artists, locations],
    )
    return get_classes(CLASS[PLURAL], distinct_classes)


def get_country_labels_for_merged_artworks_and_locations(
    locations, merged_artworks, movements
):
    tmp = [locations, merged_artworks, movements]
    distinct_ids = [
        get_distinct_attribute_values_from_dict(COUNTRY, item, True) for item in tmp
    ]

    distinct_country_ids = distinct_ids[0].union(distinct_ids[1], distinct_ids[2])
    country_labels_extracted = get_entity_labels(COUNTRY, distinct_country_ids)

    for item in tmp:
        yield resolve_entity_id_to_label(COUNTRY, item, country_labels_extracted)


def bundle_class_union_calls(distinct_classes, data_list):
    for item in data_list:
        distinct_classes = distinct_classes | get_distinct_attribute_values_from_dict(
            CLASS[PLURAL], item
        )
    return distinct_classes


def bundle_extract_data_calls(name_list, merged_artworks):
    for item in name_list:
        tmp = get_distinct_attribute_values_from_dict(item, merged_artworks)
        yield get_subject(item, tmp)


def get_fields(type_name, languageKeys=[item[0] for item in language_config_to_list()]):
    """ Returns all fields / columns for a specific type, e. g. 'artworks' """
    fields = [ID, CLASS[PLURAL], LABEL[SINGULAR], DESCRIPTION[SINGULAR], IMAGE]
    for langkey in languageKeys:
        fields += [
            f"{LABEL[SINGULAR]}_{langkey}",
            f"{DESCRIPTION[SINGULAR]}_{langkey}",
            f"{WIKIPEDIA_LINK}_{langkey}",
        ]
    if type_name in [
        DRAWING[PLURAL],
        SCULPTURE[PLURAL],
        PAINTING[PLURAL],
        ARTWORK[PLURAL],
    ]:
        fields += [
            ARTIST[PLURAL],
            LOCATION[PLURAL],
            GENRE[PLURAL],
            MOVEMENT[PLURAL],
            INCEPTION,
            MATERIAL[PLURAL],
            MOTIF[PLURAL],
            COUNTRY,
            HEIGHT,
            HEIGHT_UNIT,
            WIDTH,
            WIDTH_UNIT,
            DIAMETER,
            DIAMETER_UNIT,
            LENGTH,
            LENGTH_UNIT,
            ICONCLASS[PLURAL],
            MAIN_SUBJECT[PLURAL],
        ]
        for langkey in languageKeys:
            fields += [f"{COUNTRY}_{langkey}"]
    elif type_name == ARTIST[PLURAL]:
        fields += [
            GENDER,
            DATE_OF_BIRTH,
            DATE_OF_DEATH,
            PLACE_OF_BIRTH,
            PLACE_OF_DEATH,
            CITIZENSHIP,
            MOVEMENT[PLURAL],
            INFLUENCED_BY,
        ]
        for langkey in languageKeys:
            fields += [f"{GENDER}_{langkey}", f"{CITIZENSHIP}_{langkey}"]
    elif type_name == MOVEMENT[PLURAL]:
        fields += [INFLUENCED_BY]
    elif type_name == LOCATION[PLURAL]:
        fields += [
            COUNTRY,
            WEBSITE,
            PART_OF,
            LATITUDE[ABBREVIATION],
            LONGITUDE[ABBREVIATION],
        ]
        for langkey in languageKeys:
            fields += [f"{COUNTRY}_{langkey}"]
    elif type_name == CLASS[PLURAL]:
        fields = [ID, LABEL[SINGULAR], DESCRIPTION[SINGULAR], SUBCLASS_OF]
        for langkey in languageKeys:
            fields += [
                f"{LABEL[SINGULAR]}_{langkey}",
                f"{DESCRIPTION[SINGULAR]}_{langkey}",
            ]
    return fields


def generate_csv(name, extract_dicts, fields, filename):
    """ Generates a csv file from a dictionary """
    filename.parent.mkdir(parents=True, exist_ok=True)
    with open(
        filename.with_suffix(f".{CSV}"), "w", newline="", encoding="utf-8"
    ) as file:
        writer = csv.DictWriter(file, fieldnames=fields, delimiter=";", quotechar='"')
        writer.writeheader()
        for extract_dict in extract_dicts:
            writer.writerow(extract_dict)


def generate_json(name, extract_dicts, filename):
    """ Generates a JSON file from a dictionary """
    if len(extract_dicts) == 0:
        return
    filename.parent.mkdir(parents=True, exist_ok=True)
    with open(
        filename.with_suffix(f".{JSON}"), "w", newline="", encoding="utf-8"
    ) as file:
        arrayToDump = []
        for extract_dict in extract_dicts:
            extract_dict[TYPE] = name
            arrayToDump.append(extract_dict)
        file.write(json.dumps(arrayToDump, ensure_ascii=False))


def merge_artworks():
    """ Merges artworks from files 'paintings.json', 'drawings.json',
        'sculptures.json' (function extract_artworks) and
        stores them in a dictionary.
    """
    print(datetime.datetime.now(), "Starting with", "merging artworks")
    artworks = set()
    file_names = [
        f"{PAINTING[PLURAL]}.{JSON}",
        f"{DRAWING[PLURAL]}.{JSON}",
        f"{SCULPTURE[PLURAL]}.{JSON}",
    ]
    file_names = [
        create_new_path(ARTWORK[PLURAL], subpath=file_name) for file_name in file_names
    ]
    extract_dicts = []

    for file_name in file_names:
        with open(file_name, encoding="utf-8") as input:
            object_array = json.load(input)
            for object in object_array:
                if not object[ID] in artworks:  # remove duplicates
                    object[TYPE] = ARTWORK[SINGULAR]
                    extract_dicts.append(object)
                    artworks.add(object[ID])

    print(datetime.datetime.now(), "Finished with", "merging artworks")
    print()
    return extract_dicts


def get_distinct_attribute_values_from_dict(
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


def try_map_response_to_subject(
    response, type_name, languageKeys=[item[0] for item in language_config_to_list()],
):
    """
    Maps the default attributes which every subject has:
    qid, image, label, description, classes, wikipediaLink (including language specific attributes)
    """
    try:
        qid = response[ID]
    except Exception as error:
        logger.error("Error on qid, skipping item. Error: {0}".format(error))
        return None

    # ToDo: Extract to function
    # How to get image url
    # https://stackoverflow.com/questions/34393884/how-to-get-image-url-property-from-wikidata-item-by-api
    try:
        image = get_image_url_by_name(
            response[CLAIMS][PROPERTY_NAME_TO_PROPERTY_ID[IMAGE]][0][MAINSNAK][
                DATAVALUE
            ][VALUE]
        )
    except:
        image = ""
    label = try_get_label_or_description(response, LABEL[PLURAL], EN)
    description = try_get_label_or_description(response, DESCRIPTION[PLURAL], EN)
    classes = try_get_qid_reference_list(
        response, PROPERTY_NAME_TO_PROPERTY_ID[CLASS[SINGULAR]]
    )

    subject_dict = {
        ID: qid,
        CLASS[PLURAL]: classes,
        LABEL[SINGULAR]: label,
        DESCRIPTION[SINGULAR]: description,
        IMAGE: image,
    }

    for langkey in languageKeys:
        label_lang = try_get_label_or_description(response, LABEL[PLURAL], langkey)
        description_lang = try_get_label_or_description(
            response, DESCRIPTION[PLURAL], langkey
        )
        wikipedia_link_lang = try_get_wikipedia_link(response, langkey)
        subject_dict.update(
            {
                f"{LABEL[SINGULAR]}_{langkey}": label_lang,
                f"{DESCRIPTION[SINGULAR]}_{langkey}": description_lang,
                f"{WIKIPEDIA_LINK}_{langkey}": wikipedia_link_lang,
            }
        )

    return subject_dict


def try_map_response_to_artist(response):
    gender = try_get_first_qid(response, PROPERTY_NAME_TO_PROPERTY_ID[GENDER])
    date_of_birth = try_get_year_from_property_timestamp(
        response, PROPERTY_NAME_TO_PROPERTY_ID[DATE_OF_BIRTH]
    )
    date_of_death = try_get_year_from_property_timestamp(
        response, PROPERTY_NAME_TO_PROPERTY_ID[DATE_OF_DEATH]
    )
    # labels to be resolved later
    place_of_birth = try_get_first_qid(
        response, PROPERTY_NAME_TO_PROPERTY_ID[PLACE_OF_BIRTH]
    )
    # labels to be resolved later
    place_of_death = try_get_first_qid(
        response, PROPERTY_NAME_TO_PROPERTY_ID[PLACE_OF_DEATH]
    )
    # labels to be resolved later
    citizenship = try_get_first_qid(response, PROPERTY_NAME_TO_PROPERTY_ID[CITIZENSHIP])
    movements = try_get_qid_reference_list(
        response, PROPERTY_NAME_TO_PROPERTY_ID[MOVEMENT[SINGULAR]]
    )
    return {
        GENDER: gender,
        DATE_OF_BIRTH: date_of_birth,
        DATE_OF_DEATH: date_of_death,
        PLACE_OF_BIRTH: place_of_birth,
        PLACE_OF_DEATH: place_of_death,
        CITIZENSHIP: citizenship,
        MOVEMENT[PLURAL]: movements,
    }


def try_map_response_to_movement(response):
    start_time = try_get_year_from_property_timestamp(
        response, PROPERTY_NAME_TO_PROPERTY_ID[START_TIME]
    )
    end_time = try_get_year_from_property_timestamp(
        response, PROPERTY_NAME_TO_PROPERTY_ID[END_TIME]
    )
    # labels to be resolved later
    country = try_get_first_qid(response, PROPERTY_NAME_TO_PROPERTY_ID[COUNTRY])
    has_part = try_get_qid_reference_list(
        response, PROPERTY_NAME_TO_PROPERTY_ID[HAS_PART]
    )
    part_of = try_get_qid_reference_list(
        response, PROPERTY_NAME_TO_PROPERTY_ID[PART_OF]
    )
    return {
        START_TIME: start_time,
        END_TIME: end_time,
        COUNTRY: country,
        HAS_PART: has_part,
        PART_OF: part_of,
    }


def try_map_response_to_location(response):
    country = try_get_first_qid(response, PROPERTY_NAME_TO_PROPERTY_ID[COUNTRY])
    website = try_get_first_value(response, PROPERTY_NAME_TO_PROPERTY_ID[WEBSITE])
    part_of = try_get_qid_reference_list(
        response, PROPERTY_NAME_TO_PROPERTY_ID[PART_OF]
    )
    try:
        coordinate = response[CLAIMS][PROPERTY_NAME_TO_PROPERTY_ID[COORDINATE]][0][
            MAINSNAK
        ][DATAVALUE][VALUE]
        lat = coordinate[LATITUDE[SINGULAR]]
        lon = coordinate[LONGITUDE[SINGULAR]]
    except Exception as error:
        logger.info(
            "Error on item {0}, property {1}, error {2}".format(
                response[ID], PROPERTY_NAME_TO_PROPERTY_ID[COORDINATE], error
            )
        )
        lat = ""
        lon = ""
    return {
        COUNTRY: country,
        WEBSITE: website,
        PART_OF: part_of,
        LATITUDE[ABBREVIATION]: lat,
        LONGITUDE[ABBREVIATION]: lon,
    }


def get_subject(
    type_name, qids, languageKeys=[item[0] for item in language_config_to_list()],
):
    print(datetime.datetime.now(), f"Starting with {type_name}")
    print(f"Total {type_name} to extract: {len(qids)}")
    item_count = 0
    extract_dicts = []
    chunk_size = 50  # The chunksize 50 is allowed by the wikidata api, bigger numbers need special permissions
    subject_id_chunks = chunks(list(qids), chunk_size)
    for chunk in subject_id_chunks:
        query_result = wikidata_entity_request(chunk)

        if ENTITIES not in query_result:
            logger.error("Skipping chunk")
            continue

        for result in query_result[ENTITIES].values():
            subject_dict = try_map_response_to_subject(result, type_name)
            if subject_dict is None:
                continue
            if type_name == MOVEMENT[PLURAL] or type_name == ARTIST[PLURAL]:
                influenced_by = try_get_qid_reference_list(
                    result, PROPERTY_NAME_TO_PROPERTY_ID[INFLUENCED_BY]
                )
                subject_dict.update({INFLUENCED_BY: influenced_by})
            if type_name == MOVEMENT[PLURAL]:
                subject_dict.update(try_map_response_to_movement(result))
            if type_name == ARTIST[PLURAL]:
                subject_dict.update(try_map_response_to_artist(result))
            if type_name == LOCATION[PLURAL]:
                subject_dict.update(try_map_response_to_location(result))
            extract_dicts.append(subject_dict)

        item_count += len(chunk)
        print(f"Status of {type_name}: {item_count}/{len(qids)}", end="\r", flush=True)

    print(datetime.datetime.now(), f"Finished with {type_name}")
    return extract_dicts


def get_entity_labels(
    type_name, qids, languageKeys=[item[0] for item in language_config_to_list()],
):
    print(datetime.datetime.now(), f"Starting with {type_name} {LABEL[PLURAL]}")
    print(f"Total {type_name} {LABEL[PLURAL]} to extract: {len(qids)}")
    item_count = 0
    extract_dicts = []
    chunk_size = 50  # The chunksize 50 is allowed by the wikidata api, bigger numbers need special permissions
    id_chunks = chunks(list(qids), chunk_size)
    for chunk in id_chunks:
        query_result = wikidata_entity_request(
            chunk, props=[LABEL[PLURAL]], timeout=10
        )  # country entities take longer so timeout is increased

        if ENTITIES not in query_result:
            logger.error("Skipping chunk")
            continue

        for result in query_result[ENTITIES].values():
            try:
                qid = result[ID]
            except Exception as error:
                logger.error("Error on qid, skipping item. Error: {0}".format(error))
                continue

            label = try_get_label_or_description(result, LABEL[PLURAL], EN)
            subject_dict = {
                ID: qid,
                LABEL[SINGULAR]: label,
            }

            for langkey in languageKeys:
                label_lang = try_get_label_or_description(
                    result, LABEL[PLURAL], langkey
                )
                subject_dict.update({f"{LABEL[SINGULAR]}_{langkey}": label_lang})
            extract_dicts.append(subject_dict)

        item_count += len(chunk)
        print(
            f"Status of {type_name} {LABEL[PLURAL]}: {item_count}/{len(qids)}",
            end="\r",
            flush=True,
        )

    print(datetime.datetime.now(), f"Finished with {type_name} {LABEL[PLURAL]}")
    return extract_dicts


already_extracted_superclass_ids = set()


def get_classes(
    type_name, qids, languageKeys=[item[0] for item in language_config_to_list()],
):
    print(datetime.datetime.now(), f"Starting with {type_name}")
    if type_name == CLASS[PLURAL]:
        print(
            f"Total {type_name} to extract (only 'instance_of' of the provided qids): {len(qids)}"
        )
    else:
        print(
            f"Total {type_name} to extract (only 'subclass_of' of the provided qids): {len(qids)}"
        )
    item_count = 0
    extract_dicts = []
    chunk_size = 50  # The chunksize 50 is allowed by the wikidata api, bigger numbers need special permissions
    classes_id_chunks = chunks(list(qids), chunk_size)
    for chunk in classes_id_chunks:
        query_result = wikidata_entity_request(chunk)

        if ENTITIES not in query_result:
            logger.error("Skipping chunk")
            continue

        for result in query_result[ENTITIES].values():
            try:
                qid = result[ID]
            except Exception as error:
                logger.error("Error on qid, skipping item. Error: {0}".format(error))
                continue
            label = try_get_label_or_description(result, LABEL[PLURAL], EN)
            description = try_get_label_or_description(result, DESCRIPTION[PLURAL], EN)
            subclass_of = try_get_qid_reference_list(
                result, PROPERTY_NAME_TO_PROPERTY_ID[SUBCLASS_OF]
            )
            class_dict = {
                ID: qid,
                LABEL[SINGULAR]: label,
                DESCRIPTION[SINGULAR]: description,
                SUBCLASS_OF: subclass_of,
            }

            for langkey in languageKeys:
                label_lang = try_get_label_or_description(
                    result, LABEL[PLURAL], langkey
                )
                description_lang = try_get_label_or_description(
                    result, DESCRIPTION[PLURAL], langkey
                )
                class_dict.update(
                    {
                        f"{LABEL[SINGULAR]}_{langkey}": label_lang,
                        f"{DESCRIPTION[SINGULAR]}_{langkey}": description_lang,
                    }
                )
            extract_dicts.append(class_dict)

        item_count += len(chunk)
        print(f"Status of {type_name}: {item_count}/{len(qids)}", end="\r", flush=True)

    superclasses_qids = get_distinct_attribute_values_from_dict(
        SUBCLASS_OF, extract_dicts
    )
    missing_superclass_qids = []

    for superclass_id in superclasses_qids:
        if superclass_id not in already_extracted_superclass_ids:
            missing_superclass_qids.append(superclass_id)

    if len(missing_superclass_qids) == 0:
        return extract_dicts
    else:
        [
            already_extracted_superclass_ids.add(superclass_id)
            for superclass_id in superclasses_qids
        ]
        superclasses = get_classes("subclasses", missing_superclass_qids)
        for superclass in superclasses:
            extract_dicts.append(superclass)
        return extract_dicts


def get_unit_symbols(qids):
    print(datetime.datetime.now(), f"Starting with unit symbols")
    print(f"Total unit symbols to extract: {len(qids)}")
    item_count = 0
    extract_dicts = []
    chunk_size = 50  # The chunksize 50 is allowed by the wikidata api, bigger numbers need special permissions
    id_chunks = chunks(list(qids), chunk_size)
    for chunk in id_chunks:
        query_result = wikidata_entity_request(chunk, props=[CLAIMS], timeout=10)

        if ENTITIES not in query_result:
            logger.error("Skipping chunk")
            continue

        for result in query_result[ENTITIES].values():
            try:
                qid = result[ID]
            except Exception as error:
                logger.error("Error on qid, skipping item. Error: {0}".format(error))
                continue

            unit_symbol = try_get_unit_symbol(
                result, PROPERTY_NAME_TO_PROPERTY_ID[UNIT_SYMBOL]
            )

            subject_dict = {ID: qid, UNIT_SYMBOL: unit_symbol}
            extract_dicts.append(subject_dict)

        item_count += len(chunk)
        print(f"Status of unit symbols: {item_count}/{len(qids)}", end="\r", flush=True)

    print(datetime.datetime.now(), f"Finished with unit symbols")
    return extract_dicts


def resolve_unit_id_to_unit_symbol(artwork_dict, unit_symbols):
    attribute_names = [HEIGHT_UNIT, WIDTH_UNIT, LENGTH_UNIT, DIAMETER_UNIT]
    qid_unit_symbol_dict = {}
    for unit_symbol_obj in unit_symbols:
        qid_unit_symbol_dict[unit_symbol_obj[ID]] = unit_symbol_obj

    for artwork_object in artwork_dict:
        for attribute_name in attribute_names:
            if artwork_object[attribute_name] != "":
                entity_id = artwork_object[attribute_name]
                artwork_object[attribute_name] = qid_unit_symbol_dict[entity_id][
                    UNIT_SYMBOL
                ]
            else:
                artwork_object[attribute_name] = ""

    return artwork_dict


def resolve_entity_id_to_label(
    attribute_name,
    artwork_dict,
    labels,
    languageKeys=[item[0] for item in language_config_to_list()],
):
    # labels objects to qid_labels_dict
    qid_labels_dict = {}
    for label_obj in labels:
        qid_labels_dict[label_obj[ID]] = label_obj

    for artwork_object in artwork_dict:
        if artwork_object[attribute_name] != "":
            entity_id = artwork_object[attribute_name]
            artwork_object[attribute_name] = qid_labels_dict[entity_id][
                f"{LABEL[SINGULAR]}_{EN}"
            ]
            for langkey in languageKeys:
                artwork_object[f"{attribute_name}_{langkey}"] = qid_labels_dict[
                    entity_id
                ][f"{LABEL[SINGULAR]}_{langkey}"]
        else:
            for langkey in languageKeys:
                artwork_object[f"{attribute_name}_{langkey}"] = ""

    return artwork_dict


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "-d":
        if len(sys.argv) > 2 and sys.argv[2].isdigit():
            DEV_CHUNK_LIMIT = int(sys.argv[2])
        print("DEV MODE: on, DEV_LIM={0}".format(DEV_CHUNK_LIMIT))
        DEV = True

    logger.info("Extracting Art Ontology")
    extract_art_ontology()
