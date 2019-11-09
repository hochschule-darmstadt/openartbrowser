
import csv
import os


def readLanguageConfigFile():
    fileName = os.path.dirname(os.path.abspath(__file__)) + "/languageconfig.csv"
    languageKeys = []
    with open(fileName, encoding = "utf-8") as file:
        configReader = csv.reader(file, delimiter=";")
        for row in configReader:
            if row[0] != "langkey":
                languageKeys.append(row[0])
    return languageKeys
