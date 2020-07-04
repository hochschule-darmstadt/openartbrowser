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
import json
from pathlib import Path
from typing import Any, Dict, List

from shared.constants import (
    ABSTRACT,
    CITIZENSHIP,
    COUNTRY,
    CRAWLER_OUTPUT,
    DESCRIPTION,
    GENDER,
    LABEL,
    SINGULAR,
    WIKIPEDIA_LINK,
    PLACE_OF_BIRTH,
    PLACE_OF_DEATH,
    EXHIBITION_HISTORY,
    SIGNIFICANT_EVENT,
    JSON,
)
from shared.utils import generate_json, language_config_to_list

language_values = language_config_to_list()
language_keys = [item[0] for item in language_values]


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
                            if (
                                not exhibition[f"{attribute}_{langkey}"]
                                and attribute not in ignored_attributes
                            ):
                                exhibition = fill_language_gaps(attribute, exhibition)
                            else:
                                exhibition[attribute] = exhibition[
                                    f"{attribute}_{langkey}"
                                ]
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
                                list_of_labels.append(
                                    item[LABEL[SINGULAR] + "_" + langkey]
                                )
                            event[key] = list_of_labels

                continue

            # Check if element has language data and if attribute needs to be ignored by gap filling
            elif (
                not tempjson[element + "_" + langkey]
                and element not in ignored_attributes
            ):
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


if __name__ == "__main__":
    art_ontology_file = (
        Path(__file__).resolve().parent.parent / CRAWLER_OUTPUT / "art_ontology.json"
    )
    print(
        datetime.datetime.now(),
        "Starting with splitting art_ontology.json to its language files",
    )

    with open(art_ontology_file, encoding="utf-8") as json_file:
        art_ontology = json.load(json_file)

        for lang_key in language_keys:
            art_ontology_for_lang = []
            print(f"Start generating art_ontology_{lang_key}.{JSON}")
            for i, item in enumerate(art_ontology):
                art_ontology_for_lang.append(modify_langdict(item, lang_key))

            art_ontology_for_lang = remove_language_key_attributes_in_exhibitions(
                art_ontology_for_lang
            )

            generate_json(
                art_ontology_for_lang,
                Path(__file__).resolve().parent.parent
                / CRAWLER_OUTPUT
                / f"art_ontology_{lang_key}",
            )
            print(f"Finished generating art_ontology_{lang_key}.{JSON}")

    print(
        datetime.datetime.now(),
        "Finished with splitting art_ontology.json to its language files",
    )
