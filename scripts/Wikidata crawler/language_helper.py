import csv
import os


def language_config_to_dictionary(config_file=os.path.dirname(os.path.abspath(__file__)) + "\\languageconfig.csv"):
    """
    Reads the languageconfig.csv to a dictionary and returns it

    :arg config_file languageconfig.csv consists of two columns langkey and language
    """
    result = {}
    with open(config_file, encoding="utf-8", mode='r') as file:
        reader = csv.DictReader(file, delimiter=';')
        for row in reader:
            result[row['langkey']] = row['language']
        return result

def generate_langdict_arrays():
    """[Generates empty array of dictonaries, one for each language defined in languageconfig.csv ]
    
    Returns:
        [array[]] -- [empty array of arrays, where index = languages count of languageconfig.csv]
    """
    dictlist = [[] for x in range(len(list(language_config_to_dictionary().keys())))]
    return dictlist