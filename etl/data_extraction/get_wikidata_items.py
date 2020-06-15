"""Get relevant wikidata entities

Examples:
    Get all artwork entities from the three crawled artwork classes: drawings, paintings, sculptures
    python3 get_wikidata_items.py

    Get one chunk per artwork subclass
    python3 get_wikidata_items.py -d

    Get two chunks per artwork subclass
    python3 get_wikidata_items.py -d 2

Returns:
    Different *.json and *.csv files for the extracted wikidata entities which are mapped to the openArtBrowser entities/models
    - artworks.json/.csv
        - paintings.json/.csv
        - drawings.json/.csv
        - sculptures.json/.csv
    - artists.json/.csv
    - classes.json/.csv
    - genres.json/.csv
    - locations.json/.csv
    - materials.json/.csv
    - motifs.json/.csv
    - movements.json/.csv
"""
import csv
import datetime
import hashlib
import json
import sys
import time
from pathlib import Path
from urllib.error import HTTPError
from typing import List, Dict, Set, Iterator, Optional

from data_extraction import map_wd_attribute
from data_extraction import map_wd_response
from data_extraction.constants import *
from data_extraction.request_utils import send_http_request
from shared.utils import chunks, create_new_path, language_config_to_list, setup_logger
from shared.constants import JSON, CSV
from SPARQLWrapper import SPARQLWrapper

DEV = False
DEV_CHUNK_LIMIT = 2  # Not entry but chunks of 50

logger = setup_logger(
    "data_extraction.get_wikidata_items",
    Path(__file__).parent.parent.absolute() / "logs" / GET_WIKIDATA_ITEMS_LOG_FILENAME,
)

lang_keys = [item[0] for item in language_config_to_list()]


def query_artwork_qids(type_name: str, wikidata_id: str) -> List[str]:
    """Extracts all artwork QIDs from the wikidata SPARQL endpoint https://query.wikidata.org/

    Args:
        type_name: type name to extract from, only relevant for console output
        wikidata_id: wikidata qid related to the given type name

    Returns:
        A list of all qids of the provided wikidata_id

    Examples:
        query_artwork_qids(DRAWING[PLURAL], DRAWING[ID])
    """
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
    qids: List[str],
    language_keys: Optional[List[str]] = lang_keys,
    props: Optional[List[str]] = [
        CLAIMS,
        DESCRIPTION[PLURAL],
        LABEL[PLURAL],
        SITELINKS,
    ],
    timeout: Optional[int] = TIMEOUT,
    sleep_time: Optional[int] = SLEEP_TIME,
    maxlag: Optional[int] = MAX_LAG,
) -> Dict:
    """Represents an wikidata entity request for a list of qids
    The API specifies that 50 items can be loaded at once without needing additional permissions:
    https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities

    Args:
        qids: List of qids
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv
        props: Properties of the entity request. Defaults to [CLAIMS, DESCRIPTION[PLURAL], LABEL[PLURAL], SITELINKS]
        timeout: Timeout for the queries. Defaults to TIMEOUT
        sleep_time: Sleep time if errors occur. Defaults to SLEEP_TIME
        maxlag: Maxlag for the wikidata server see https://www.mediawiki.org/wiki/Manual:Maxlag_parameter. Defaults to MAX_LAG

    Returns:
        Raw wikidata response for the requested entities

    Examples:
        wikidata_entity_request(["Q12418", "Q45585"])
    """
    initial_timeout = timeout
    langkeyPlusWikiList = [key + "wiki" for key in language_keys]
    parameters = {
        "action": "wbgetentities",
        "ids": "|".join(qids),
        "format": JSON,
        "languages": "|".join(language_keys),
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


def get_image_url_by_name(image_name: str) -> str:
    """Calculate the image url from the image name

    This is done via the MD5 hash of the image_names hex-code.

    Args:
        image_name: image name returned from the wikidata API call

    Returns:
        URL of the image
    """
    image_name = image_name.replace(" ", "_")
    hash = hashlib.md5(image_name.encode("utf-8")).hexdigest()
    hash_index_1 = hash[0]
    hash_index_1_and_2 = hash[0] + hash[1]
    url = "https://upload.wikimedia.org/wikipedia/commons/{0}/{1}/{2}".format(
        hash_index_1, hash_index_1_and_2, image_name
    )
    return url


def extract_artworks(
    type_name: str,
    wikidata_id: str,
    already_crawled_wikidata_items: Set,
    language_keys: Optional[List[str]] = lang_keys,
) -> List[Dict]:
    """Extracts artworks metadata from Wikidata and stores them in a dictionary.

    Args:
        type_name: Type name of an artwork e. g. 'drawings'. Important for console output
        wikidata_id: Wikidata Id of a class; all instances of this class and all subclasses with image will be loaded. See artworks_ids_query.sparql
        already_crawled_wikidata_items: Set of all already crawled artwork items. Because the types have common items it is necessary to avoid loading items multiple times
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv

    Returns:
        A list with all artwork entity dicts (or JSON-objects) which are transformed for the OAB

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

            label = map_wd_attribute.try_get_label_or_description(
                result, LABEL[PLURAL], EN, type_name
            )
            description = map_wd_attribute.try_get_label_or_description(
                result, DESCRIPTION[PLURAL], EN, type_name
            )

            (
                classes,
                artists,
                locations,
                genres,
                movements,
                materials,
                motifs,
                main_subjects,
            ) = map_wd_attribute.get_attribute_values_with_try_get_func(
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
                type_name,
                map_wd_attribute.try_get_qid_reference_list,
            )

            iconclasses = map_wd_attribute.try_get_value_list(
                result, PROPERTY_NAME_TO_PROPERTY_ID[ICONCLASS[SINGULAR]], type_name
            )
            inception = map_wd_attribute.try_get_year_from_property_timestamp(
                result, PROPERTY_NAME_TO_PROPERTY_ID[INCEPTION], type_name
            )
            country = map_wd_attribute.try_get_first_qid(
                result, PROPERTY_NAME_TO_PROPERTY_ID[COUNTRY], type_name
            )

            # Resolve dimensions
            # The units are qids which have to be resolved later
            (
                height,
                width,
                length,
                diameter,
            ) = map_wd_attribute.get_attribute_values_with_try_get_func(
                result,
                [HEIGHT, WIDTH, LENGTH, DIAMETER],
                type_name,
                map_wd_attribute.try_get_dimension_value,
            )
            (
                height_unit,
                width_unit,
                length_unit,
                diameter_unit,
            ) = map_wd_attribute.get_attribute_values_with_try_get_func(
                result,
                [HEIGHT, WIDTH, LENGTH, DIAMETER],
                type_name,
                map_wd_attribute.try_get_dimension_unit,
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

            for langkey in language_keys:
                label_lang = map_wd_attribute.try_get_label_or_description(
                    result, LABEL[PLURAL], langkey, type_name
                )
                description_lang = map_wd_attribute.try_get_label_or_description(
                    result, DESCRIPTION[PLURAL], langkey, type_name
                )
                wikipedia_link_lang = map_wd_attribute.try_get_wikipedia_link(
                    result, langkey, type_name
                )
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


def extract_art_ontology() -> None:
    """Extracts *.csv and *.json files for artworks and subjects (e. g. motifs, movements) from wikidata
    """

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
        generate_csv(extracted_artwork, get_fields(artwork), path_name)

        path_name = create_new_path(ARTWORK[PLURAL], artwork, JSON)
        generate_json(artwork, extracted_artwork, path_name)

    merged_artworks = merge_artworks()

    path_name = create_new_path(ARTWORK[PLURAL], file_type=CSV)
    generate_csv(
        merged_artworks, get_fields(ARTWORK[PLURAL]) + [TYPE], path_name,
    )

    # Get motifs and main subjects
    motifs = extract_motifs_and_main_subjects(merged_artworks)

    # Get extracted genres, materials, etc.
    genres, materials, movements, artists, locations = bundle_extract_subjects_calls(
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
    distinct_unit_qids = get_distinct_unit_symbol_qids(merged_artworks)
    unit_symbols = get_unit_symbols(distinct_unit_qids)
    resolve_unit_id_to_unit_symbol(merged_artworks, unit_symbols)

    # Write to JSON
    write_data_to_json_and_csv(
        motifs,
        genres,
        extracted_classes,
        materials,
        movements,
        locations,
        merged_artworks,
        artists,
    )


def extract_motifs_and_main_subjects(merged_artworks: List[Dict]) -> List[Dict]:
    """Function to extract motifs and main subjects

    Args:
        merged_artworks: List of merged artwork entities

    Returns:
        List of motif entities
    """
    motifs = get_distinct_attribute_values_from_dict(MOTIF[PLURAL], merged_artworks)
    main_subjects = get_distinct_attribute_values_from_dict(
        MAIN_SUBJECT[PLURAL], merged_artworks
    )

    motifs_and_main_subjects = motifs | main_subjects
    motifs = get_subject("motifs and main subjects", motifs_and_main_subjects)
    return motifs


def write_data_to_json_and_csv(
    motifs: List[Dict],
    genres: List[Dict],
    extracted_classes: List[Dict],
    materials: List[Dict],
    movements: List[Dict],
    locations: List[Dict],
    merged_artworks: List[Dict],
    artists: List[Dict],
) -> None:
    """Writes the given lists of dictionaries to json and csv files

    Args:
        motifs: List of motifs
        genres: List of genres
        extracted_classes: List of classes
        materials: List of materials
        movements: List of movements
        locations: List of locations
        merged_artworks: List of artworks
        artists: List of artists
    """
    generate_json(MOTIF[SINGULAR], motifs, create_new_path(MOTIF[PLURAL]))
    generate_csv(
        motifs,
        get_fields(MOTIF[PLURAL]) + [TYPE],
        create_new_path(MOTIF[PLURAL], file_type=CSV),
    )
    generate_json(GENRE[SINGULAR], genres, create_new_path(GENRE[PLURAL]))
    generate_csv(
        genres,
        get_fields(GENRE[PLURAL]) + [TYPE],
        create_new_path(GENRE[PLURAL], file_type=CSV),
    )
    generate_json(CLASS[SINGULAR], extracted_classes, create_new_path(CLASS[PLURAL]))
    generate_csv(
        extracted_classes,
        get_fields(CLASS[PLURAL]) + [TYPE],
        create_new_path(CLASS[PLURAL], file_type=CSV),
    )
    generate_json(MATERIAL[SINGULAR], materials, create_new_path(MATERIAL[PLURAL]))
    generate_csv(
        materials,
        get_fields(MATERIAL[PLURAL]) + [TYPE],
        create_new_path(MATERIAL[PLURAL], file_type=CSV),
    )
    generate_json(MOVEMENT[SINGULAR], movements, create_new_path(MOVEMENT[PLURAL]))
    generate_csv(
        movements,
        get_fields(MOVEMENT[PLURAL]) + [TYPE],
        create_new_path(MOVEMENT[PLURAL], file_type=CSV),
    )
    generate_json(LOCATION[SINGULAR], locations, create_new_path(LOCATION[PLURAL]))
    generate_csv(
        locations,
        get_fields(LOCATION[PLURAL]) + [TYPE],
        create_new_path(LOCATION[PLURAL], file_type=CSV),
    )
    generate_json(ARTWORK[SINGULAR], merged_artworks, create_new_path(ARTWORK[PLURAL]))
    generate_csv(
        merged_artworks,
        get_fields(ARTWORK[PLURAL]) + [TYPE],
        create_new_path(ARTWORK[SINGULAR], file_type=CSV),
    )
    generate_json(ARTIST[SINGULAR], artists, create_new_path(ARTIST[PLURAL]))
    generate_csv(
        artists,
        get_fields(ARTIST[PLURAL]) + [TYPE],
        create_new_path(ARTIST[PLURAL], file_type=CSV),
    )


def get_distinct_unit_symbol_qids(merged_artworks: List[Dict]) -> Set[str]:
    """Load the distinct qids from the unit symbol attribute of all entities

    Args:
        merged_artworks: List of artworks

    Returns:
        Set of distinct unit ids
    """
    distinct_unit_qids = get_distinct_attribute_values_from_dict(
        HEIGHT_UNIT, merged_artworks, True
    )

    for item in [WIDTH_UNIT, LENGTH_UNIT, DIAMETER_UNIT]:
        distinct_unit_qids = distinct_unit_qids.union(
            get_distinct_attribute_values_from_dict(item, merged_artworks, True)
        )
    return distinct_unit_qids


def get_labels_for_artists(artists: List[Dict], prop_list: List[str]) -> List[Dict]:
    """Resolve the labels from qids in the artist entities

    Args:
        artists: List artist entities
        prop_list: List of properties to resolve

    Returns:
        Updated artist entities with resolved labels
    """
    for item in prop_list:
        distinct_label = get_distinct_attribute_values_from_dict(item, artists, True)
        extracted_labels = get_entity_labels(item, distinct_label)
        resolve_entity_id_to_label(item, artists, extracted_labels)
    return artists


def get_distinct_extracted_classes(
    merged_artworks: List[Dict],
    motifs: List[Dict],
    genres: List[Dict],
    materials: List[Dict],
    movements: List[Dict],
    artists: List[Dict],
    locations: List[Dict],
) -> List[Dict]:
    """Load the distinct qids from the classes lists of all entities

    Args:
        merged_artworks: List of artworks
        motifs: List of motif entities
        genres: List of genre entities
        materials: List of material entities
        movements: List of movement entities
        artists: List of artist entities
        locations: List of location entities

    Returns:
        List of class entities
    """
    distinct_classes = get_distinct_attribute_values_from_dict(
        CLASS[PLURAL], merged_artworks
    )
    distinct_classes = bundle_class_union_calls(
        distinct_classes, [motifs, genres, materials, movements, artists, locations],
    )
    return get_classes(CLASS[PLURAL], distinct_classes)


def get_country_labels_for_merged_artworks_and_locations(
    locations: List[Dict], merged_artworks: List[Dict], movements: List[Dict]
) -> Iterator[List[Dict]]:
    """Resolve the country qids for the merged artworks and locations to labels

    Args:
        locations: List of location entities
        merged_artworks: List of artwork entities
        movements: List of movement entities

    Yields:
        Yields the updated list of entities with resolved country qids to their labels
    """
    tmp = [locations, merged_artworks, movements]
    distinct_ids = [
        get_distinct_attribute_values_from_dict(COUNTRY, item, True) for item in tmp
    ]

    distinct_country_ids = distinct_ids[0].union(distinct_ids[1], distinct_ids[2])
    country_labels_extracted = get_entity_labels(COUNTRY, distinct_country_ids)

    for item in tmp:
        yield resolve_entity_id_to_label(COUNTRY, item, country_labels_extracted)


def bundle_class_union_calls(
    distinct_classes: Set[str], oab_type_list: List[str]
) -> Set[str]:
    """Bundles the calls for each openArtBrowser type where the 'instance of' ids are extracted from
    to a set of class qids

    Args:
        distinct_classes: A set of qids from the 'instance of' attribute
        oab_type_list: A list of oab types to extract the 'instance of' attribute from e. g. ['motifs', 'artworks', ...]

    Returns:
        Returns a set with distinct class qids
    """
    for item in oab_type_list:
        distinct_classes = distinct_classes | get_distinct_attribute_values_from_dict(
            CLASS[PLURAL], item
        )
    return distinct_classes


def bundle_extract_subjects_calls(
    oab_type_list: List[str], merged_artworks: List[Dict]
) -> Iterator[List[Dict]]:
    """Bundles the extract subjects calls

    Args:
        oab_type_list: A list of oab types to extract from wikidata
        merged_artworks: The already crawled list of dictionaries to extract subjects like movements, motifs etc. from

    Yields:
        A list of dicts with from for the given oab type
    """
    for item in oab_type_list:
        yield get_subject(
            item, get_distinct_attribute_values_from_dict(item, merged_artworks)
        )


def get_fields(
    type_name: str, language_keys: Optional[List[str]] = lang_keys,
) -> List[str]:
    """Returns all columns for a specific type, e. g. 'artworks'

    Args:
        type_name: Type to get the column names for
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv

    Returns:
        A list of column names for the given type name
    """
    fields = [ID, CLASS[PLURAL], LABEL[SINGULAR], DESCRIPTION[SINGULAR], IMAGE]
    for langkey in language_keys:
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
        for langkey in language_keys:
            fields += [f"{COUNTRY}_{langkey}"]
    elif type_name == ARTIST[PLURAL]:
        for langkey in language_keys:
            fields += [f"{PLACE_OF_BIRTH}_{langkey}", f"{PLACE_OF_DEATH}_{langkey}"]
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
        for langkey in language_keys:
            fields += [f"{GENDER}_{langkey}", f"{CITIZENSHIP}_{langkey}"]
    elif type_name == MOVEMENT[PLURAL]:
        for langkey in language_keys:
            fields += [f"{COUNTRY}_{langkey}"]
        fields += [INFLUENCED_BY, PART_OF, END_TIME, COUNTRY, HAS_PART, START_TIME]
    elif type_name == LOCATION[PLURAL]:
        fields += [
            COUNTRY,
            WEBSITE,
            PART_OF,
            LATITUDE[ABBREVIATION],
            LONGITUDE[ABBREVIATION],
        ]
        for langkey in language_keys:
            fields += [f"{COUNTRY}_{langkey}"]
    elif type_name == CLASS[PLURAL]:
        fields = [ID, LABEL[SINGULAR], DESCRIPTION[SINGULAR], SUBCLASS_OF]
        for langkey in language_keys:
            fields += [
                f"{LABEL[SINGULAR]}_{langkey}",
                f"{DESCRIPTION[SINGULAR]}_{langkey}",
            ]
    return fields


def generate_csv(extract_dicts: List[Dict], fields: List[str], filename: str) -> None:
    """Generates a csv file from a dictionary

    Args:
        extract_dicts: List of dicts that containing wikidata entities transformed to oab entities
        fields: Column names for the given dicts
        filename: Name of the file to write the data to
    """
    filename.parent.mkdir(parents=True, exist_ok=True)
    with open(
        filename.with_suffix(f".{CSV}"), "w", newline="", encoding="utf-8"
    ) as file:
        writer = csv.DictWriter(file, fieldnames=fields, delimiter=";", quotechar='"')
        writer.writeheader()
        for extract_dict in extract_dicts:
            writer.writerow(extract_dict)


def generate_json(name: str, extract_dicts: List[Dict], filename: str) -> None:
    """Generates a JSON file from a dictionary

    Args:
        name: openArtBrowser type name e. g. 'artwork'
        extract_dicts: List of dicts that containing wikidata entities transformed to oab entities
        filename: Name of the file to write the data to
    """
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


def merge_artworks() -> List[Dict]:
    """Merges artworks from files 'paintings.json', 'drawings.json',
    'sculptures.json' (function extract_artworks) and
    stores them in a dictionary

    Returns:
        A list of dictionaries containing all artworks
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
    attribute_name: str,
    entry_dicts: List[Dict],
    is_single_value_column: Optional[bool] = False,
) -> Set[str]:
    """Function to get the distinct attribute values from a list of dicts

    Args:
        attribute_name: Attribute to extract the distinct values from
        entry_dicts: List of dictionaries with wikidata entities mapped to oab entities
        is_single_value_column: Modus either extract a single value or a list of values. Defaults to False.

    Returns:
        A set of distinct string values e. g. qids
    """
    attribute_set = set()
    for json_object in entry_dicts:
        if is_single_value_column:
            value = json_object[attribute_name]
            if value != "":
                attribute_set.add(value)
        else:
            for values in json_object[attribute_name]:
                attribute_set.add(values)

    return attribute_set


def get_subject(
    type_name: str, qids: List[str], language_keys: Optional[List[str]] = lang_keys,
) -> List[Dict]:
    """Extract subjects (in our definition everything except artworks e. g. movements, motifs, etc.) from wikidata

    Args:
        type_name: oab type name e. g. movements (Caution type names are always plural here)
        qids: A list of qids extracted from the artworks
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv

    Returns:
        A list of dicts with the subjects transformed from wikidata entities to oab entities
    """
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
            subject_dict = map_wd_response.try_map_response_to_subject(
                result, type_name
            )
            if subject_dict is None:
                continue
            if type_name == MOVEMENT[PLURAL] or type_name == ARTIST[PLURAL]:
                influenced_by = map_wd_attribute.try_get_qid_reference_list(
                    result, PROPERTY_NAME_TO_PROPERTY_ID[INFLUENCED_BY], type_name
                )
                subject_dict.update({INFLUENCED_BY: influenced_by})
            if type_name == MOVEMENT[PLURAL]:
                subject_dict.update(
                    map_wd_response.try_map_response_to_movement(result)
                )
            if type_name == ARTIST[PLURAL]:
                subject_dict.update(map_wd_response.try_map_response_to_artist(result))
            if type_name == LOCATION[PLURAL]:
                subject_dict.update(
                    map_wd_response.try_map_response_to_location(result)
                )
            extract_dicts.append(subject_dict)

        item_count += len(chunk)
        print(f"Status of {type_name}: {item_count}/{len(qids)}", end="\r", flush=True)

    print(datetime.datetime.now(), f"Finished with {type_name}")
    return extract_dicts


def get_entity_labels(
    type_name: str, qids: List[str], language_keys: Optional[List[str]] = lang_keys,
) -> List[Dict]:
    """Function to get the entity labels from wikidata

    Args:
        type_name: oab type e. g. movement
        qids: List of qids to extract the labels from
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv

    Returns:
        List of dicts containing the qid and the labels for each language
    """
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

            label = map_wd_attribute.try_get_label_or_description(
                result, LABEL[PLURAL], EN, type_name
            )
            subject_dict = {
                ID: qid,
                LABEL[SINGULAR]: label,
            }

            for langkey in language_keys:
                label_lang = map_wd_attribute.try_get_label_or_description(
                    result, LABEL[PLURAL], langkey, type_name
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
    type_name: str, qids: List[str], language_keys: Optional[List[str]] = lang_keys,
) -> List[Dict]:
    """Function to extract the classes of the extracted wikidata entities (meaning the 'instance of' attribute wikidata entity qids).
    Their subclasses are also extracted recursively (also called transitive closure)

    Args:
        type_name: oab type e. g. movement
        qids: List of qids to extract the labels from
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv

    Returns:
        Returns a list of dicts with the classes from the oab entities and their subclasses
    """
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
            label = map_wd_attribute.try_get_label_or_description(
                result, LABEL[PLURAL], EN, type_name
            )
            description = map_wd_attribute.try_get_label_or_description(
                result, DESCRIPTION[PLURAL], EN, type_name
            )
            subclass_of = map_wd_attribute.try_get_qid_reference_list(
                result, PROPERTY_NAME_TO_PROPERTY_ID[SUBCLASS_OF], type_name
            )
            class_dict = {
                ID: qid,
                LABEL[SINGULAR]: label,
                DESCRIPTION[SINGULAR]: description,
                SUBCLASS_OF: subclass_of,
            }

            for langkey in language_keys:
                label_lang = map_wd_attribute.try_get_label_or_description(
                    result, LABEL[PLURAL], langkey, type_name
                )
                description_lang = map_wd_attribute.try_get_label_or_description(
                    result, DESCRIPTION[PLURAL], langkey, type_name
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


def get_unit_symbols(qids: List[str]) -> List[Dict]:
    """Function to get the unit symbols from the unit entities

    Args:
        qids: List of qids

    Returns:
        List of dicts containing the unit id and their unit symbol in english language
    """
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

            unit_symbol = map_wd_attribute.try_get_unit_symbol(
                result, PROPERTY_NAME_TO_PROPERTY_ID[UNIT_SYMBOL], UNIT_SYMBOL
            )

            subject_dict = {ID: qid, UNIT_SYMBOL: unit_symbol}
            extract_dicts.append(subject_dict)

        item_count += len(chunk)
        print(f"Status of unit symbols: {item_count}/{len(qids)}", end="\r", flush=True)

    print(datetime.datetime.now(), f"Finished with unit symbols")
    return extract_dicts


def resolve_unit_id_to_unit_symbol(
    artwork_dict: List[Dict], unit_symbols: List[Dict]
) -> List[Dict]:
    """Function to resolve the unit id to the unit symbol

    Args:
        artwork_dict: List of dicts containing the artworks
        unit_symbols: List of dicts containing the unit qid and the unit symbol e. g. 'cm', 'mm', etc.

    Returns:
        The artwork dicts with the unit qid resolved to their unit symbol extracted from wikidata
    """
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
    attribute_name: str,
    extract_dicts: List[Dict],
    labels: List[Dict],
    language_keys: Optional[List[str]] = lang_keys,
) -> List[Dict]:
    """Function to resolve the entity id from an attribute to their label

    Args:
        attribute_name: Name of the attribute to be resolved to the label from their qid
        extract_dicts: List of dicts containing the artworks
        labels: List of dicts containing the qid and the label in each given language
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv

    Returns:
        List of dicts containing the artworks and the resolved attributes to their labels e. g. Q183 -> 'Germany'
    """
    # labels objects to qid_labels_dict
    qid_labels_dict = {}
    for label_obj in labels:
        qid_labels_dict[label_obj[ID]] = label_obj

    for artwork_object in extract_dicts:
        if artwork_object[attribute_name] != "":
            entity_id = artwork_object[attribute_name]
            artwork_object[attribute_name] = qid_labels_dict[entity_id][
                f"{LABEL[SINGULAR]}_{EN}"
            ]
            for langkey in language_keys:
                artwork_object[f"{attribute_name}_{langkey}"] = qid_labels_dict[
                    entity_id
                ][f"{LABEL[SINGULAR]}_{langkey}"]
        else:
            for langkey in language_keys:
                artwork_object[f"{attribute_name}_{langkey}"] = ""

    return extract_dicts


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "-d":
        if len(sys.argv) > 2 and sys.argv[2].isdigit():
            DEV_CHUNK_LIMIT = int(sys.argv[2])
        print("DEV MODE: on, DEV_LIM={0}".format(DEV_CHUNK_LIMIT))
        DEV = True

    logger.info("Extracting Art Ontology")
    extract_art_ontology()
