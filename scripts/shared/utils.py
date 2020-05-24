import csv
import pkgutil


def language_config_to_list():
    """Reads languageconfig.csv and returns array that contains its
    full contents

    Returns:
        list -- contents of languageconfig.csv as list
    """
    configReader = csv.reader(
        pkgutil.get_data("shared.utils", "languageconfig.csv")
        .decode("utf-8")
        .splitlines(),
        delimiter=";",
    )
    languageValues = []
    for row in configReader:
        if row[0] != "langkey":
            languageValues.append(row)
    return languageValues
