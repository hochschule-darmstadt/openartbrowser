import csv
import os


def get_language_attributes():
    """[Returns all attributes in crawler .csv/.json files that need
    language handling]

    Returns:
        [dict] -- [Dictionary containing all language attributes]
    """
    return ["label", "description", "gender", "citizenship", "country"]


def language_config_to_list(
    config_file=os.path.dirname(os.path.abspath(__file__)) + "\\languageconfig.csv",
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


def generate_langdict_arrays():
    """[Generates empty array of dictonaries, one for each language
     defined in languageconfig.csv ]

    Returns:
        [array[]] -- [empty array of arrays, where index = languages
         count of languageconfig.csv]
    """
    dictlist = [[] for x in range(len(language_config_to_list()))]
    return dictlist
