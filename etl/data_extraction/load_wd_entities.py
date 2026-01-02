"""Script that contains all functions which load WD entities"""

# ruff: noqa: F403 F405
import datetime
import re
import time
from json import JSONDecodeError
from pathlib import Path
from typing import Callable, Dict, Iterator, List, Optional, Set
from urllib.error import HTTPError

from SPARQLWrapper import SPARQLWrapper

from data_extraction import map_wd_attribute, map_wd_response
from data_extraction.constants import *
from data_extraction.request_utils import send_http_request
from shared.blocklist import BLOCKLIST
from shared.utils import (
    chunks,
    language_config_to_list,
    setup_logger,
)

logger = setup_logger(
    "data_extraction.load_wd_entities",
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
    QID_BY_ARTWORK_TYPE_QUERY = open(artwork_ids_filepath, "r", encoding="utf8").read().replace("$QID", wikidata_id)

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
        except JSONDecodeError as error:
            print(error)
            print("Waiting for 5 seconds")
            time.sleep(5)
            continue

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
    props: Optional[List[str]] = None,
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
        maxlag: Maxlag for the wikidata server see https://www.mediawiki.org/wiki/Manual:Maxlag_parameter.
            Defaults to MAX_LAG

    Returns:
        Raw wikidata response for the requested entities

    Examples:
        wikidata_entity_request(["Q12418", "Q45585"])
    """
    if props is None:
        props = [CLAIMS, DESCRIPTION[PLURAL], LABEL[PLURAL], SITELINKS]
    initial_timeout = timeout
    langkeyPlusWikiList = [key + "wiki" for key in language_keys]
    parameters = {
        "action": "wbgetentities",
        "ids": "|".join(qids),
        "format": JSON,
        "languages": "|".join(language_keys),
        "sitefilter": "|".join(langkeyPlusWikiList),
        "props": "|".join(props),
        "redirects": "no",
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


def extract_artworks(
    type_name: str,
    wikidata_id: str,
    already_crawled_wikidata_items: Set,
    dev_mode: bool,
    dev_chunk_limit: int,
    language_keys: Optional[List[str]] = lang_keys,
) -> List[Dict]:
    """Extracts artworks metadata from Wikidata and stores them in a dictionary.

    Args:
        type_name: Type name of an artwork e. g. 'drawings'. Important for console output
        wikidata_id: Wikidata Id of a class; all instances of this class and all subclasses
        with image will be loaded. See artworks_ids_query.sparql
        already_crawled_wikidata_items: Set of all already crawled artwork items.
        Because the types have common items it is necessary to avoid loading items multiple times
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv
        dev_mode: To reduce the number of loaded chunks set this to true
        dev_chunk_limit: Limit of chunks per category
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
        f"{len(artwork_ids)} {type_name} entries are not loaded yet, starting now. "
        f"Already crawled item count is {len(already_crawled_wikidata_items)}"
    )
    chunk_size = 50  # The chunksize 50 is allowed by the wikidata api, bigger numbers need special permissions
    artwork_id_chunks = chunks(artwork_ids, chunk_size)
    for chunk in artwork_id_chunks:
        if dev_mode and chunk_count == dev_chunk_limit:
            logger.info(f"DEV_CHUNK_LIMIT of {type_name} reached. End extraction for {type_name}")
            break

        query_result = wikidata_entity_request(chunk)
        if ENTITIES not in query_result:
            logger.error("Skipping chunk")
            continue

        for result in query_result[ENTITIES].values():
            try:
                qid = result[ID]
                image = map_wd_attribute.get_image_url_by_name(
                    result[CLAIMS][PROPERTY_NAME_TO_PROPERTY_ID[IMAGE]][0][MAINSNAK][DATAVALUE][VALUE]
                )
            except Exception as error:
                logger.error("Error on qid or image, skipping item. Result set: {0}, Error: {1}".format(result, error))
                continue

            label = map_wd_attribute.try_get_label_or_description(result, LABEL[PLURAL], EN, type_name)
            description = map_wd_attribute.try_get_label_or_description(result, DESCRIPTION[PLURAL], EN, type_name)

            (
                classes,
                artists,
                locations,
                genres,
                movements,
                materials,
                motifs,
                main_subjects,
                exhibition_history,
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
                    EXHIBITION_HISTORY,
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
            country = map_wd_attribute.try_get_first_qid(result, PROPERTY_NAME_TO_PROPERTY_ID[COUNTRY], type_name)

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

            significant_events = map_wd_attribute.try_get_significant_events(result)

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
                EXHIBITION_HISTORY: exhibition_history,
                SIGNIFICANT_EVENT: significant_events,
                TYPE: ARTWORK[SINGULAR],
            }

            # Apply blocklist to artwork dictionary
            for t in [
                CLASS[PLURAL],
                ARTIST[PLURAL],
                LOCATION[PLURAL],
                GENRE[PLURAL],
                MOVEMENT[PLURAL],
                MATERIAL[PLURAL],
                MOTIF[PLURAL],
                ICONCLASS[PLURAL],
                MAIN_SUBJECT[PLURAL],
                EXHIBITION_HISTORY,
            ]:
                try:
                    artwork_dictionary[t] = list(set(artwork_dictionary[t]) - set(BLOCKLIST))
                except Exception as e:
                    logger.exception(e)
                    continue

            for langkey in language_keys:
                label_lang = map_wd_attribute.try_get_label_or_description(result, LABEL[PLURAL], langkey, type_name)
                description_lang = map_wd_attribute.try_get_label_or_description(
                    result, DESCRIPTION[PLURAL], langkey, type_name
                )
                wikipedia_link_lang = map_wd_attribute.try_get_wikipedia_link(result, langkey, type_name)
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


def load_entities_by_attribute_with_transitive_closure(
    extract_dicts: List[Dict],
    attribute_name: str,
    oab_type: str,
    already_extracted_ids: Set[str],
    entity_extraction_func: Callable[[str, List[str], Set[str], Optional[List[str]]], tuple[List[Dict], Set[str]]],
    allowed_instances_of: List[str],
) -> tuple[List[Dict], Set[str]]:
    """Recursive function to load all entities which a attribute contains.

    Remarks:
        This would be also possible with a SPARQL query however when we tested it
        with the wikidata query service it was extremly unperformant and the API
        only allows 1 minute queries

    Args:
        extract_dicts: Already extracted entities, the new entities are added to this list
        attribute_name: Attribute which should be loaded with a transitive closure
        already_extracted_ids: list that tracks the already extracted ids
        allowed_instances_of: The extracted entity has to be instance of one provided qid in the list

    Returns:
        Updated list of dicts with recursively loaded entities by an attribute
        and the updated set of already extracted ids
    """
    qids = get_distinct_attribute_values_from_dict(attribute_name, extract_dicts)
    missing_qids = []

    for id in qids:
        if id not in already_extracted_ids:
            missing_qids.append(id)

    if len(missing_qids) == 0:
        return extract_dicts, already_extracted_ids
    else:
        [already_extracted_ids.add(id) for id in qids]
        entities, already_extracted_ids = entity_extraction_func(oab_type, missing_qids, already_extracted_ids)
        for entity in entities:
            # Check if an entity with the same qid is in the dict, if not then add
            if not any(e[ID] == entity[ID] for e in extract_dicts):
                # Check if allowed instances of has values
                if allowed_instances_of:
                    # If it has values only allow entities which have instance of ids
                    # in the allowed instances of list
                    if not set(entity[CLASS[PLURAL]]).isdisjoint(allowed_instances_of):
                        extract_dicts.append(entity)
                else:
                    extract_dicts.append(entity)
        return extract_dicts, already_extracted_ids


# region subjects
def get_subject(
    type_name: str,
    qids: List[str],
    already_extracted_movement_ids: Set[str] = None,
    language_keys: Optional[List[str]] = lang_keys,
) -> tuple[List[Dict], Set[str]]:
    """Extract subjects (in our definition everything except artworks e. g. movements, motifs, etc.) from wikidata

    Args:
        type_name: oab type name e. g. movements (Caution type names are always plural here)
        qids: A list of qids extracted from the artworks
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv

    Returns:
        A list of dicts with the subjects transformed from wikidata entities to oab entities
    """
    if already_extracted_movement_ids is None:
        already_extracted_movement_ids = set()
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
            subject_dict = map_wd_response.try_map_response_to_subject(result, type_name)
            if subject_dict is None:
                continue
            if type_name == MOVEMENT[PLURAL] or type_name == ARTIST[PLURAL]:
                influenced_by = map_wd_attribute.try_get_qid_reference_list(
                    result, PROPERTY_NAME_TO_PROPERTY_ID[INFLUENCED_BY], type_name
                )
                subject_dict.update({INFLUENCED_BY: influenced_by})
            if type_name == MOVEMENT[PLURAL]:
                subject_dict.update(map_wd_response.try_map_response_to_movement(result))
                already_extracted_movement_ids.add(subject_dict[ID])
            if type_name == ARTIST[PLURAL]:
                subject_dict.update(map_wd_response.try_map_response_to_artist(result))
            if type_name == LOCATION[PLURAL]:
                subject_dict.update(map_wd_response.try_map_response_to_location(result))
            extract_dicts.append(subject_dict)

        item_count += len(chunk)
        print(f"Status of {type_name}: {item_count}/{len(qids)}", end="\r", flush=True)

    if type_name == MOVEMENT[PLURAL]:
        extract_dicts, already_extracted_movement_ids = load_entities_by_attribute_with_transitive_closure(
            extract_dicts,
            PART_OF,
            MOVEMENT[PLURAL],
            already_extracted_movement_ids,
            get_subject,
            [ART_MOVEMENT[ID], ART_STYLE[ID]],
        )
        extract_dicts, already_extracted_movement_ids = load_entities_by_attribute_with_transitive_closure(
            extract_dicts,
            HAS_PART,
            MOVEMENT[PLURAL],
            already_extracted_movement_ids,
            get_subject,
            [ART_MOVEMENT[ID], ART_STYLE[ID]],
        )
        return extract_dicts, already_extracted_movement_ids

    print(datetime.datetime.now(), f"Finished with {type_name}")
    return extract_dicts, already_extracted_movement_ids


def bundle_extract_subjects_calls(oab_type_list: List[str], merged_artworks: List[Dict]) -> Iterator[List[Dict]]:
    """Bundles the extract subjects calls

    Args:
        oab_type_list: A list of oab types to extract from wikidata
        merged_artworks: The already crawled list of dictionaries to extract subjects like movements, motifs etc. from

    Yields:
        A list of dicts with from for the given oab type
    """
    for item in oab_type_list:
        extract_dicts, _ids = get_subject(item, get_distinct_attribute_values_from_dict(item, merged_artworks))
        yield extract_dicts


# endregion


def extract_motifs_and_main_subjects(merged_artworks: List[Dict]) -> List[Dict]:
    """Function to extract motifs and main subjects

    Args:
        merged_artworks: List of merged artwork entities

    Returns:
        List of motif entities
    """
    motifs = get_distinct_attribute_values_from_dict(MOTIF[PLURAL], merged_artworks)
    main_subjects = get_distinct_attribute_values_from_dict(MAIN_SUBJECT[PLURAL], merged_artworks)

    motifs_and_main_subjects = motifs | main_subjects
    motifs, _ = get_subject(MOTIF[PLURAL], motifs_and_main_subjects)
    return motifs


# region unit symbols
def get_distinct_unit_symbol_qids(merged_artworks: List[Dict]) -> Set[str]:
    """Load the distinct qids from the unit symbol attribute of all entities

    Args:
        merged_artworks: List of artworks

    Returns:
        Set of distinct unit ids
    """
    distinct_unit_qids = get_distinct_attribute_values_from_dict(HEIGHT_UNIT, merged_artworks, True)

    for item in [WIDTH_UNIT, LENGTH_UNIT, DIAMETER_UNIT]:
        distinct_unit_qids = distinct_unit_qids.union(
            get_distinct_attribute_values_from_dict(item, merged_artworks, True)
        )
    return distinct_unit_qids


def get_unit_symbols(qids: List[str]) -> List[Dict]:
    """Function to get the unit symbols from the unit entities

    Args:
        qids: List of qids

    Returns:
        List of dicts containing the unit id and their unit symbol in english language
    """
    print(datetime.datetime.now(), "Starting with unit symbols")
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

    print(datetime.datetime.now(), "Finished with unit symbols")
    return extract_dicts


def resolve_unit_id_to_unit_symbol(artwork_dict: List[Dict], unit_symbols: List[Dict]) -> List[Dict]:
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
                artwork_object[attribute_name] = qid_unit_symbol_dict[entity_id][UNIT_SYMBOL]
            else:
                artwork_object[attribute_name] = ""

    return artwork_dict


# endregion


# region classes
def get_classes(
    type_name: str,
    qids: List[str],
    already_extracted_superclass_ids: Set[str] = None,
    language_keys: Optional[List[str]] = lang_keys,
) -> tuple[List[Dict], Set[str]]:
    """Function to extract the classes of the extracted wikidata entities
        (meaning the 'instance of' attribute wikidata entity qids).
    Their subclasses are also extracted recursively (also called transitive closure)

    Args:
        type_name: oab type e. g. movement
        qids: List of qids to extract the labels from
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv
        already_extracted_superclass_ids: A list of already extracted superclass ids for the recursive calls,
        this is also the anchor to stop recursion

    Returns:
        Returns a list of dicts with the classes from the oab entities and their subclasses
    """
    if already_extracted_superclass_ids is None:
        already_extracted_superclass_ids = set()
    print(datetime.datetime.now(), f"Starting with {type_name}")
    if type_name == CLASS[PLURAL]:
        print(f"Total {type_name} to extract (only 'instance_of' of the provided qids): {len(qids)}")
    else:
        print(f"Total {type_name} to extract (only 'subclass_of' of the provided qids): {len(qids)}")
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
            label = map_wd_attribute.try_get_label_or_description(result, LABEL[PLURAL], EN, type_name)
            description = map_wd_attribute.try_get_label_or_description(result, DESCRIPTION[PLURAL], EN, type_name)
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
                label_lang = map_wd_attribute.try_get_label_or_description(result, LABEL[PLURAL], langkey, type_name)
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

    extract_dicts, _ids = load_entities_by_attribute_with_transitive_closure(
        extract_dicts,
        SUBCLASS_OF,
        CLASS[PLURAL],
        already_extracted_superclass_ids,
        get_classes,
        [],
    )
    return extract_dicts, _ids


def bundle_class_union_calls(distinct_classes: Set[str], oab_type_list: List[str]) -> Set[str]:
    """Bundles the calls for each openArtBrowser type where the 'instance of' ids are extracted from
    to a set of class qids

    Args:
        distinct_classes: A set of qids from the 'instance of' attribute
        oab_type_list: A list of oab types to extract the 'instance of' attribute from e. g. ['motifs', 'artworks', ...]

    Returns:
        Returns a set with distinct class qids
    """
    for item in oab_type_list:
        distinct_classes = distinct_classes | get_distinct_attribute_values_from_dict(CLASS[PLURAL], item)
    return distinct_classes


def get_distinct_extracted_classes(
    merged_artworks: List[Dict],
    motifs: List[Dict],
    genres: List[Dict],
    materials: List[Dict],
    movements: List[Dict],
    artists: List[Dict],
    locations: List[Dict],
    classes: List[Dict],
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
        classes: List of class entities

    Returns:
        List of class entities
    """
    distinct_classes = get_distinct_attribute_values_from_dict(CLASS[PLURAL], merged_artworks)
    distinct_classes = bundle_class_union_calls(
        distinct_classes,
        [motifs, genres, materials, movements, artists, locations, classes],
    )
    distinct_classes, _ids = get_classes(CLASS[PLURAL], distinct_classes)
    return distinct_classes


# endregion


# region resolve qids to labels
def get_entity_labels(
    type_name: str,
    qids: List[str],
    language_keys: Optional[List[str]] = lang_keys,
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

            label = map_wd_attribute.try_get_label_or_description(result, LABEL[PLURAL], EN, type_name)
            subject_dict = {
                ID: qid,
                LABEL[SINGULAR]: label,
            }

            for langkey in language_keys:
                label_lang = map_wd_attribute.try_get_label_or_description(result, LABEL[PLURAL], langkey, type_name)
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
            artwork_object[attribute_name] = qid_labels_dict[entity_id][f"{LABEL[SINGULAR]}_{EN}"]
            for langkey in language_keys:
                artwork_object[f"{attribute_name}_{langkey}"] = qid_labels_dict[entity_id][
                    f"{LABEL[SINGULAR]}_{langkey}"
                ]
        else:
            for langkey in language_keys:
                artwork_object[f"{attribute_name}_{langkey}"] = ""

    return extract_dicts


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
    distinct_ids = [get_distinct_attribute_values_from_dict(COUNTRY, item, True) for item in tmp]

    distinct_country_ids = distinct_ids[0].union(distinct_ids[1], distinct_ids[2])
    country_labels_extracted = get_entity_labels(COUNTRY, distinct_country_ids)

    for item in tmp:
        yield resolve_entity_id_to_label(COUNTRY, item, country_labels_extracted)


# endregion


# region exhibitions
def get_exhibition_entities(
    qids: Set[str],
    language_keys: Optional[List[str]] = lang_keys,
    type_name: str = EXHIBITION,
) -> Dict[str, Dict]:
    """Function to get the exhibition entities from wikidata

    Args:
        qids: Distinct qid set to get the entities from
        language_keys: Language keys to extract label and description from. Defaults to languageconfig.csv
        type_name: OAB type name. Defaults to EXHIBITION.

    Returns:
        A dict with the qids as key and the JSON object as value
    """
    print(datetime.datetime.now(), "Starting with exhibition entities")
    print(f"Total exhibition entities to extract: {len(qids)}")
    item_count = 0
    extract_dicts = {}
    chunk_size = 50  # The chunksize 50 is allowed by the wikidata api, bigger numbers need special permissions
    id_chunks = chunks(list(qids), chunk_size)
    for chunk in id_chunks:
        query_result = wikidata_entity_request(chunk)
        for result in query_result[ENTITIES].values():
            try:
                qid = result[ID]
            except Exception as error:
                logger.error("Error on qid, skipping item. Error: {0}".format(error))
                continue
            label = map_wd_attribute.try_get_label_or_description(result, LABEL[PLURAL], EN, type_name)
            description = map_wd_attribute.try_get_label_or_description(result, DESCRIPTION[PLURAL], EN, type_name)
            start_time = map_wd_attribute.try_get_year_from_property_timestamp(
                result, PROPERTY_NAME_TO_PROPERTY_ID[START_TIME], type_name
            )
            end_time = map_wd_attribute.try_get_year_from_property_timestamp(
                result, PROPERTY_NAME_TO_PROPERTY_ID[END_TIME], type_name
            )

            extract_dicts.update(
                {
                    qid: {
                        LABEL[SINGULAR]: label,
                        DESCRIPTION[SINGULAR]: description,
                        START_TIME: start_time,
                        END_TIME: end_time,
                        TYPE: EXHIBITION,
                    }
                }
            )

            for langkey in language_keys:
                label_lang = map_wd_attribute.try_get_label_or_description(result, LABEL[PLURAL], langkey, type_name)
                description_lang = map_wd_attribute.try_get_label_or_description(
                    result, DESCRIPTION[PLURAL], langkey, type_name
                )
                extract_dicts[qid][f"{LABEL[SINGULAR]}_{langkey}"] = label_lang
                extract_dicts[qid][f"{DESCRIPTION[SINGULAR]}_{langkey}"] = description_lang

        item_count += len(chunk)
        print(
            f"Status of exhibition entities: {item_count}/{len(qids)}",
            end="\r",
            flush=True,
        )

    print(datetime.datetime.now(), "Finished with exhibition entities")
    return extract_dicts


def resolve_exhibition_ids_to_exhibition_entities(artwork_dict: List[Dict]):
    """Function to resolve the exhibition qids to exhibition entities which are part of artwork entities

    Args:
        artwork_dict: List of artworks

    Returns:
        Modified artwork list with exhibition ids resolved to JSON objects
    """
    distinct_exhibition_ids = get_distinct_attribute_values_from_dict(EXHIBITION_HISTORY, artwork_dict)
    qid_exhibition_entity_dict = get_exhibition_entities(distinct_exhibition_ids)

    for artwork in artwork_dict:
        if artwork[
            EXHIBITION_HISTORY
        ]:  # When there are exhibitions in the exhibition history attribute replace them with a dict (JSON object)
            for i, qid in enumerate(artwork[EXHIBITION_HISTORY]):
                artwork[EXHIBITION_HISTORY][i] = qid_exhibition_entity_dict[qid]

    return artwork_dict


# endregion


# ruff: noqa: C901
def resolve_significant_event_id_entities_to_labels(artwork_dict: List[Dict]):
    """Function to resolve the labels from significant events entity ids

    Args:
        artwork_dict: List of artworks

    Returns:
        Modified artwork list with significant event ids resolved to JSON objects
    """
    distinct_entity_ids = set()
    for artwork in artwork_dict:
        if SIGNIFICANT_EVENT in artwork:
            for event in artwork[SIGNIFICANT_EVENT]:
                for key, value in event.items():
                    if key == TYPE:
                        continue
                    elif (
                        key in PROPERTY_ID_TO_PROPERTY_NAME
                        or key == LABEL[SINGULAR]
                        or key in PROPERTY_NAME_TO_PROPERTY_ID
                        or key.endswith(f"_{UNIT}")
                    ):
                        pass  # go on if the key is recognized
                    else:
                        logger.error(
                            f"Unknown property was tried to extract. Please add the property {key} to the constants.py"
                        )

                    if value and type(value) is list:
                        distinct_entity_ids.update(value)
                    elif value and type(value) is str and re.match(QID_PATTERN, value):
                        distinct_entity_ids.add(value)
                    else:
                        logger.info(f"The value: {value} is no list of qids or a qid")

    entity_labels = {item[ID]: item for item in get_entity_labels("significant events", list(distinct_entity_ids))}

    for artwork in artwork_dict:
        if SIGNIFICANT_EVENT in artwork and artwork[SIGNIFICANT_EVENT]:
            for event in artwork[SIGNIFICANT_EVENT]:
                for key, value in event.items():
                    if value and type(value) is list:
                        tmp_values = []
                        for item in value:
                            if type(item) is str and re.match(QID_PATTERN, item):
                                tmp_values.append(entity_labels[item])
                        event[key] = tmp_values
                    elif value and type(value) is str and re.match(QID_PATTERN, value):
                        event[key] = entity_labels[value]
                    else:
                        logger.info(f"The value: {value} is no list of qids or a qid")

    return artwork_dict
