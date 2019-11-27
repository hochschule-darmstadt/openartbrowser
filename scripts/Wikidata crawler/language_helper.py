import csv
import os
from array import array


def read_language_config():
    """[Reads languageconfig.csv and returns array that contains its keys]
    
    Returns:
        [array] -- [keys of languageconfig.csv as string]
    """
    fileName = os.path.dirname(os.path.abspath(__file__)) + "/languageconfig.csv"
    languageKeys = []
    with open(fileName, encoding = "utf-8") as file:
        configReader = csv.reader(file, delimiter=";")
        for row in configReader:
            if row[0] != "langkey":
                languageKeys.append(row[0])
    return languageKeys

def read_full_language_config():
    """[Reads languageconfig.csv and returns array that contains its full contents]
    
    Returns:
        [array] -- [contents of languageconfig.csv as list]
    """
    fileName = os.path.dirname(os.path.abspath(__file__)) + "/languageconfig.csv"
    languageKeys = []
    with open(fileName, encoding = "utf-8") as file:
        configReader = csv.reader(file, delimiter=";")
        for row in configReader:
            if row[0] != "langkey":
                languageKeys.append(row)
    return languageKeys


def generate_langdict_arrays():
    """[Generates empty array of dictonaries, one for each language defined in languageconfig.csv ]
    
    Returns:
        [array[]] -- [empty array of arrays, where index = languages count of languageconfig.csv]
    """
    dictlist = [[] for x in range(len(read_language_config()))]
    return dictlist
