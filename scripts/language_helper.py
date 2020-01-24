from pathlib import Path
import csv


def language_config_to_list(
    config_file=Path(__file__).parent.absolute() / "languageconfig.csv",
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
