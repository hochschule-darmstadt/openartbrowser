import csv
import pkgutil


def agent_header():
    return "<nowiki>https://cai-artbrowserstaging.fbi.h-da.de/; tilo.w.michel@stud.h-da.de</nowiki>"


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def language_config_to_list():
    """Reads languageconfig.csv and returns array that contains its
    full contents

    Returns:
        list -- contents of languageconfig.csv as list
    """
    configReader = csv.reader(
        pkgutil.get_data("utils", "languageconfig.csv").decode("utf-8").splitlines(),
        delimiter=";",
    )
    languageValues = []
    for row in configReader:
        if row[0] != "langkey":
            languageValues.append(row)
    return languageValues
