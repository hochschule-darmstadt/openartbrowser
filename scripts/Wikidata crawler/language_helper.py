import csv
import os
from array import array


def read_language_config():
    """[Reads languageconfig.csv and an return array that contains its contents]
    
    Returns:
        [array] -- [contents of languageconfig.csv]
    """
    fileName = os.path.dirname(os.path.abspath(__file__)) + "/languageconfig.csv"
    languageKeys = []
    with open(fileName, encoding = "utf-8") as file:
        configReader = csv.reader(file, delimiter=";")
        for row in configReader:
            if row[0] != "langkey":
                languageKeys.append(row[0])
    return languageKeys

def generate_langdict_arrays():
    """[Generates empty array of dictonaries, one for each language defined in languageconfig.csv ]
    
    Returns:
        [array[]] -- [empty array of arrays, where index = languages count of languageconfig.csv]
    """
    dictlist = [[] for x in range(len(read_language_config()))]
    return dictlist
