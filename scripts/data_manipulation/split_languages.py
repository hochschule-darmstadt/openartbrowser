# splits art_ontology file into language art_ontology_files

import simplejson as json
import ijson
from pathlib import Path
import sys
import csv

def get_language_attributes():
    """[Returns all attributes in crawler .csv/.json files that need
    language handling]

    Returns:
        [dict] -- [Dictionary containing all language attributes]
    """
    return ["label", "description", "gender", "citizenship", "country"]

def get_ignored_by_gap_filling():
    """[Returns all attributes in crawler .csv/.json files that are ignored when applying
    gap filling algorithm for missing language data]

    Returns:
        [dict] -- [Dictionary containing all ignored attributes]
    """
    return ["description", "gender", "citizenship", "country"]

def generate_langdict_arrays():
    """[Generates empty array of dictonaries, one for each language
     defined in languageconfig.csv ]

    Returns:
        [array[]] -- [empty array of arrays, where index = languages
         count of languageconfig.csv]
    """
    dictlist = [[] for x in range(len(language_config_to_list()))]
    return dictlist

def fill_language_gaps(element, jsonobject):
    """[Fills language data into empty elements based on priority,
    which is the languageconfig.csv order]

    Arguments:
        element {[string]} -- [Name of the key which is in need of
         gap filling]
        jsonobject {[dict]} -- [Relevant dict which contains all data
         specific to the element]
        Returns:
        [dict] -- [Updated json file with language gaps filled in / or
        not if no language data existant]
    """
    for row in language_values:
        try:
            # Skip empty language data
            if not jsonobject[element + "_" + row[0]]:
                next
            # Assign language data to element
            else:
                jsonobject[element] = (
                    jsonobject[element + "_" + row[0]]
                )
        # Should not happen if key attributes in json are atleast existent
        except KeyError:
            if (element == "label") or (element == "description"):
                print(
                    "Warning! 'label' or 'description' language data might "
                    + "not exist fully in art_ontology.json"
                    + ". Id of .json-object: "
                    + jsonobject["id"]
                )
            pass
    return jsonobject


def modify_langdict(langdict, jsonobject, langkey):
    """[modifies lang dictionary data by manipulating key values
    or deleting keys mostly used to get rid of additional language keys]

    Arguments:
        langdict {[array[dict]]} -- [internal language container for the
            language specified in langkey]
        jsonobject {[dict]} -- [json object from art_ontology file that is passed to our
            internal dictionaries]
        langkey {[str]} -- [language key used for modification]

    Returns:
        [array[dict]] -- [modified language container]
    """
    # Language keys that need language specific handling
    lang_attributes = get_language_attributes()
    ignored_attributes = get_ignored_by_gap_filling()
    tempjson = jsonobject.copy()
    delete_keys = []
    for element in lang_attributes:
        try:
            #Check if element has language data and if attribute needs to be ignored by gap filling
            if not tempjson[element + "_" + langkey] and not element in ignored_attributes: 
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

    langdict.append(tempjson)
    return langdict


def generate_langjson_files(name, extract_dicts):
    """[writes temporary language specific data to language files]

    Arguments:
        name {[str]} -- [Name of the generated json language file]
        extract_dicts {[dict]} -- [dictionary that is written into the output file]
    """
    with open(
        Path(__file__).resolve().parent.parent / "crawler_output" / str(name + ".json"), "w", newline="", encoding="utf-8"
    ) as file:
        file.write(json.dumps(extract_dicts, ensure_ascii=False))


def language_config_to_list(
    config_file=Path(__file__).parent.parent.absolute() / "languageconfig.csv"
):
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

# load languageconfig file with keys / language dicts
language_skeleton = generate_langdict_arrays()
language_values = language_config_to_list()
language_keys = [item[0] for item in language_values]

if __name__ == "__main__":
    art_ontology_file = Path(__file__).resolve().parent.parent / "crawler_output" / "art_ontology.json"
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
        generate_langjson_files("art_ontology_" + language_keys[i], language_skeleton[i])
        i += 1
