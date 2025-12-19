"""Splits art_ontology.json file into language art_ontology_{langkey}.json files for each language in languageconfig.csv

Pre-conditions:
    The art_ontology.json file has to be existing in order for this script to be executable

Examples:
    python3 split_languages.py

Returns:
    An art_ontology.json file for each language in languageconfig.csv
    The format for these files is art_ontology_{language_key}.json
"""

import copy
import datetime
import sys
from pathlib import Path
from typing import Any, Dict, List

import ijson
import json
from decimal import Decimal

from shared.constants import (
    ABSTRACT,
    CITIZENSHIP,
    COUNTRY,
    CRAWLER_OUTPUT,
    DESCRIPTION,
    ETL_STATES,
    EXHIBITION_HISTORY,
    GENDER,
    JSON,
    INTERMEDIATE_FILES,
    LABEL,
    PLACE_OF_BIRTH,
    PLACE_OF_DEATH,
    SIGNIFICANT_EVENT,
    SINGULAR,
    WIKIPEDIA_LINK,
    ARTWORK,
    MOTIF,
    GENRE,
    MATERIAL,
    MOVEMENT,
    ARTIST,
    LOCATION,
    CLASS,
    PLURAL,
)
from shared.utils import check_state, create_new_path, is_jsonable, language_config_to_list, write_state

language_values = language_config_to_list()
language_keys = [item[0] for item in language_values]

RECOVER_MODE = False


def get_language_attributes() -> List[str]:
    """Returns all attributes in crawler .csv/.json files that need language handling

    Returns:
        List containing all language attributes
    """
    return [
        LABEL[SINGULAR],
        DESCRIPTION[SINGULAR],
        GENDER,
        CITIZENSHIP,
        COUNTRY,
        ABSTRACT,
        WIKIPEDIA_LINK,
        PLACE_OF_BIRTH,
        PLACE_OF_DEATH,
        EXHIBITION_HISTORY,
        SIGNIFICANT_EVENT,
    ]


def get_ignored_by_gap_filling() -> List[str]:
    """Returns all attributes in data extraction *.csv/*.json files that are ignored when applying
    gap filling algorithm for missing language data

    Returns:
        List containing all ignored attributes
    """
    return [
        DESCRIPTION[SINGULAR],
        GENDER,
        CITIZENSHIP,
        COUNTRY,
        ABSTRACT,
        WIKIPEDIA_LINK,
    ]


def fill_language_gaps(element: str, jsonobject: Dict) -> Dict:
    """Fills language data into empty elements based on priority, which is the languageconfig.csv order

    Args:
        element: Name of the key which is in need of gap filling
        jsonobject: Relevant dict which contains all data specific to the element

    Returns:
        Updated json file with language gaps filled in / or not if no language data existant
    """
    for row in language_values:
        try:
            # Skip empty language data
            if not jsonobject[f"{element}_{row[0]}"]:
                continue
            # Assign language data to element
            else:
                jsonobject[element] = jsonobject[f"{element}_{row[0]}"]
                break
        # Should not happen if key attributes in json are atleast existent
        except KeyError:
            if element == LABEL[SINGULAR] or element == DESCRIPTION[SINGULAR]:
                print(
                    "Warning! 'label' or 'description' language data might "
                    + "not exist fully in art_ontology.json"
                    + ". Id of .json-object: "
                    + jsonobject["id"]
                )
    return jsonobject


# ruff: noqa: C901
def modify_langdict(jsonobject: Dict, langkey: str) -> List[List[Any]]:
    """Modifies lang dictionary data by manipulating key values or deleting keys
    mostly used to get rid of additional language keys

    Args:
        lang_container: Internal language container for the language specified in langkey
        jsonobject: Json object from art_ontology file that is passed to our internal dictionaries
        langkey: Language key used for modification

    Returns:
        Modified language container
    """
    # Language keys that need language specific handling
    lang_attributes = get_language_attributes()
    ignored_attributes = get_ignored_by_gap_filling()
    # The deepcopy is needed since exhibition history + significant events are nested json objects
    tempjson = copy.deepcopy(jsonobject)
    delete_keys = []
    for element in lang_attributes:
        try:
            # Exhibition history and significant events need seperate handling
            # because of their representation as nested JSON Objects
            if element == EXHIBITION_HISTORY and tempjson[EXHIBITION_HISTORY]:
                for exhibition in tempjson[EXHIBITION_HISTORY]:
                    try:
                        for attribute in [LABEL[SINGULAR], DESCRIPTION[SINGULAR]]:
                            if not exhibition[f"{attribute}_{langkey}"] and attribute not in ignored_attributes:
                                exhibition = fill_language_gaps(attribute, exhibition)
                            else:
                                exhibition[attribute] = exhibition[f"{attribute}_{langkey}"]
                    except KeyError as key_error:
                        print(f"Error with attribute: {key_error}")

                continue

            elif element == SIGNIFICANT_EVENT and tempjson[SIGNIFICANT_EVENT]:
                for event in tempjson[SIGNIFICANT_EVENT]:
                    for key, value in event.items():
                        if type(value) is dict:
                            event[key] = event[key][LABEL[SINGULAR] + "_" + langkey]
                        elif type(value) is list:
                            list_of_labels = []
                            for item in value:
                                list_of_labels.append(item[LABEL[SINGULAR] + "_" + langkey])
                            event[key] = list_of_labels

                continue

            # Check if element has language data and if attribute needs to be ignored by gap filling
            elif not tempjson[element + "_" + langkey] and element not in ignored_attributes:
                tempjson = fill_language_gaps(element, tempjson)
            else:
                tempjson[element] = tempjson[element + "_" + langkey]
            # Using dictionary comprehension to find keys for deletion later
            delete_keys.extend([key for key in tempjson if element + "_" in key])
        # Ignore if key doesnt exist
        except KeyError:
            if (element == "label") or (element == "description"):
                print(
                    "Warning! 'label' or 'description' language data might not exist fully in art_ontology.json"
                    + ". Id of .json-object: "
                    + tempjson["id"]
                )

    # delete the language dependend key-value pairs e. g. label_en
    for key in delete_keys:
        del tempjson[key]

    return tempjson


def remove_language_key_attributes_in_exhibitions(
    language_file: List[Dict], lang_keys: List[str] = language_keys
) -> List[Dict]:
    """Removes the language dependent attributes from the exhibitions objects

    Args:
        language_file: List of dicts which is written to e. g. art_ontology_en.json
        lang_keys: All supported languages. Defaults to languageconfig.csv

    Returns:
        language_file without the language dependent attributes (e. g. label_en)
    """
    for entity in language_file:
        if EXHIBITION_HISTORY in entity and entity[EXHIBITION_HISTORY]:
            for attribute in [LABEL[SINGULAR], DESCRIPTION[SINGULAR]]:
                for key in lang_keys:
                    for exhibition in entity[EXHIBITION_HISTORY]:
                        if f"{attribute}_{key}" in exhibition:
                            del exhibition[f"{attribute}_{key}"]

    return language_file


def _open_new_batch_file(lang_key: str, part_idx: int, output_dir: Path):
    filename = output_dir / f"art_ontology_{lang_key}_part_{part_idx:05d}.ndjson"
    f = open(filename, "w", encoding="utf-8")
    return f, filename


def _write_batches_for_languages(item_iterator, batch_size: int = 1000, output_dir: Path = None):
    """Stream items from `item_iterator` and write per-language NDJSON batch files.

    Args:
        item_iterator: iterator that yields JSON objects (artwork dicts)
        batch_size: number of items per output file
        output_dir: directory where to write files (crawler_output)
    """
    if output_dir is None:
        output_dir = Path(__file__).resolve().parent.parent / CRAWLER_OUTPUT
    output_dir.mkdir(parents=True, exist_ok=True)

    # track file handles and counts per language
    handles = {}
    part_idx = {}
    counts = {}

    for lang in language_keys:
        part_idx[lang] = 1
        counts[lang] = 0
        handles[lang], _ = _open_new_batch_file(lang, part_idx[lang], output_dir)

    total = 0
    for item in item_iterator:
        total += 1
        if not is_jsonable(item):
            continue
        for lang in language_keys:
            modified = modify_langdict(item, lang)
            modified = remove_language_key_attributes_in_exhibitions([modified], [lang])[0]

            # sanitize non-serializable types (e.g., Decimal) before writing
            def _sanitize(obj):
                # recursively convert Decimal to float and sanitize nested structures
                if isinstance(obj, Decimal):
                    return float(obj)
                if isinstance(obj, dict):
                    return {k: _sanitize(v) for k, v in obj.items()}
                if isinstance(obj, list):
                    return [_sanitize(v) for v in obj]
                return obj

            sanitized = _sanitize(modified)
            # write to current file for lang
            handles[lang].write(json.dumps(sanitized, ensure_ascii=False) + "\n")
            counts[lang] += 1
            if counts[lang] >= batch_size:
                handles[lang].close()
                part_idx[lang] += 1
                handles[lang], _ = _open_new_batch_file(lang, part_idx[lang], output_dir)
                counts[lang] = 0

    # close remaining handles
    for lang in language_keys:
        try:
            handles[lang].close()
        except Exception:
            pass


if __name__ == "__main__":
    # CLI args: optional -r (recover), -b batch size
    import argparse
    import os

    parser = argparse.ArgumentParser(description="Split merged art_ontology stream into per-language NDJSON batches")
    parser.add_argument("-r", dest="recover", action="store_true", help="recover mode")
    parser.add_argument("-b", dest="batch", type=int, default=None, help="batch size per output file")
    args = parser.parse_args()
    # Batch size preference order:
    # 1. CLI `-b` argument (if provided)
    # 2. Environment variable `ART_ONTOLOGY_BATCH_SIZE` (if set)
    # 3. Default 1000
    env_batch = os.getenv("ART_ONTOLOGY_BATCH_SIZE")
    if args.batch is None:
        try:
            batch_size = int(env_batch) if env_batch is not None else 1000
        except ValueError:
            print(f"Invalid ART_ONTOLOGY_BATCH_SIZE='{env_batch}', falling back to 1000")
            batch_size = 1000
    else:
        batch_size = args.batch

    if args.recover and check_state(ETL_STATES.DATA_TRANSFORMATION.SPLIT_LANGUAGES, Path(__file__).parent.parent):
        exit(0)

    print(datetime.datetime.now(), "Starting merge+split into per-language batches")

    # If an aggregated art_ontology.json exists, stream from it. Otherwise stream the per-type intermediate files.
    crawler_dir = Path(__file__).resolve().parent.parent / CRAWLER_OUTPUT
    aggregated = crawler_dir / "art_ontology.json"
    item_iter = None
    if aggregated.exists():
        f = open(aggregated, encoding="utf-8")
        item_iter = ijson.items(f, "item")
    else:
        # look for intermediate files under intermediate_files/json
        inter_dir = Path(__file__).resolve().parent.parent / CRAWLER_OUTPUT / INTERMEDIATE_FILES / JSON
        filenames = [
            ARTWORK[PLURAL],
            MOTIF[PLURAL],
            GENRE[PLURAL],
            MATERIAL[PLURAL],
            MOVEMENT[PLURAL],
            ARTIST[PLURAL],
            LOCATION[PLURAL],
            CLASS[PLURAL],
        ]

        def gen():
            for filename in filenames:
                if not (filepath:=create_new_path(filename).with_suffix(f".{JSON}")).exists():
                    continue
                with open(filepath, encoding="utf-8") as file:
                    for item in ijson.items(file, "item"):
                        yield item

        item_iter = gen()

    _write_batches_for_languages(item_iter, batch_size=batch_size, output_dir=crawler_dir)
    print(datetime.datetime.now(), "Finished merge+split into per-language batches")
    write_state(ETL_STATES.DATA_TRANSFORMATION.SPLIT_LANGUAGES, Path(__file__).parent.parent)
