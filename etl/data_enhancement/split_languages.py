"""Splits art_ontology.json file into language art_ontology_{langkey}.json files for each language in languageconfig.csv

Pre-conditions:
    The art_ontology.json file has to be existing in order for this script to be executable

Examples:
    python3 split_languages.py

Returns:
    An art_ontology.json file for each language in languageconfig.csv
    The format for these files is art_ontology_{language_key}.json
"""
from pathlib import Path
from typing import List, Dict, Any

import ijson
import simplejson as json

from shared.utils import language_config_to_list


language_values = language_config_to_list()


def generate_lang_container() -> List[List[Any]]:
    """Generates a empty list of lists, one for each language defined in languageconfig.csv

    Returns:
        Empty list of lists, where index equals languages count of languageconfig.csv
    """
    return [[] for x in range(len(language_values))]


# load languageconfig file with keys / language dicts
language_skeleton = generate_lang_container()
language_keys = [item[0] for item in language_values]


def get_language_attributes() -> List[str]:
    """Returns all attributes in crawler .csv/.json files that need language handling

    Returns:
        List containing all language attributes
    """
    return [
        "label",
        "description",
        "gender",
        "citizenship",
        "country",
        "abstract",
        "wikipediaLink",
    ]


def get_ignored_by_gap_filling() -> List[str]:
    """Returns all attributes in data extraction *.csv/*.json files that are ignored when applying
    gap filling algorithm for missing language data

    Returns:
        List containing all ignored attributes
    """
    return [
        "description",
        "gender",
        "citizenship",
        "country",
        "abstract",
        "wikipediaLink",
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
            if not jsonobject[element + "_" + row[0]]:
                next
            # Assign language data to element
            else:
                jsonobject[element] = jsonobject[element + "_" + row[0]]
        # Should not happen if key attributes in json are atleast existent
        except KeyError:
            if (element == "label") or (element == "description"):
                print(
                    "Warning! 'label' or 'description' language data might "
                    + "not exist fully in art_ontology.json"
                    + ". Id of .json-object: "
                    + jsonobject["id"]
                )
    return jsonobject


def modify_langdict(
    lang_container: List[List[Any]], jsonobject: Dict, langkey: str
) -> List[List[Any]]:
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
    tempjson = jsonobject.copy()
    delete_keys = []
    for element in lang_attributes:
        try:
            # Check if element has language data and if attribute needs to be ignored by gap filling
            if (
                not tempjson[element + "_" + langkey]
                and element not in ignored_attributes
            ):
                tempjson = fill_language_gaps(element, tempjson)
            else:
                tempjson[element] = tempjson[element + "_" + langkey]
            # Using dictionary comprehension to find keys for deletion later
            dltkey = [key for key in tempjson if element + "_" in key]
            delete_keys.extend(dltkey)
        # Ignore if key doesnt exist
        except KeyError:
            if (element == "label") or (element == "description"):
                print(
                    "Warning! 'label' or 'description' language data might not exist fully in art_ontology.json"
                    + ". Id of .json-object: "
                    + tempjson["id"]
                )
            pass

    # delete the keys
    for key in delete_keys:
        del tempjson[key]

    lang_container.append(tempjson)
    return lang_container


def generate_lang_json_files(filename: str, extract_dicts: List[Dict]) -> None:
    """Writes temporary language specific data to language files

    Args:
        filename: Filename of the generated json language file
        extract_dicts: List of dicts that is written into the output file
    """
    with open(
        Path(__file__).resolve().parent.parent
        / "crawler_output"
        / str(filename + ".json"),
        "w",
        newline="",
        encoding="utf-8",
    ) as file:
        file.write(json.dumps(extract_dicts, ensure_ascii=False))


if __name__ == "__main__":
    art_ontology_file = (
        Path(__file__).resolve().parent.parent / "crawler_output" / "art_ontology.json"
    )
    for item in ijson.items(open(art_ontology_file, "r", encoding="utf-8"), "item"):
        i = 0
        # iterate through all language keys and write the json object
        # in an modified state into the language dictionary arrays
        while i < len(language_keys):
            language_skeleton[i] = modify_langdict(
                language_skeleton[i], item, language_keys[i]
            )
            i += 1

    i = 0
    # generate one art_ontology_<language_code> file per language defined in config file.
    # fill the contents of the respective language dicitonary arrays into the files
    while i < len(language_skeleton):
        generate_lang_json_files(
            "art_ontology_" + language_keys[i], language_skeleton[i]
        )
        i += 1
