"""Shared util functions across all python scripts
"""
import csv
import logging
import pkgutil
from pathlib import Path
from typing import List

from shared.constants import CRAWLER_OUTPUT, INTERMEDIATE_FILES, JSON

root_logger = logging.getLogger()  # setup root logger
root_logger.setLevel(
    logging.DEBUG
)  # the root logger needs a debug level so that everything works correctly


def language_config_to_list() -> List[List[str]]:
    """Reads languageconfig.csv and returns array that contains its full contents

    Returns:
        Contents of languageconfig.csv as List of lists
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


def setup_logger(logger_name: str, filename: str):
    """Setup a logger for a python script.
    The root logging object is created within this helper script.
    Args:
        logger_name: Package + module name e.g. 'data_extraction.get_wikidata_items'
        filename: String to the path and file the logger writes to

    Returns:
        Logger object
    """
    format = "%(asctime)s %(name)-12s %(levelname)-8s %(message)s"
    date_format = "%d.%m.%Y %H:%M"
    file_formatter = logging.Formatter(format, date_format)
    console_formatter = logging.Formatter("%(name)-12s: %(levelname)-8s %(message)s")

    logger = logging.getLogger(logger_name)

    file_handler = logging.FileHandler(filename)
    file_handler.setFormatter(file_formatter)
    file_handler.setLevel(logging.DEBUG)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.WARNING)  # Print warnings and errors to console
    console_handler.setFormatter(console_formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    return logger


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def create_new_path(name, subpath="", file_type=JSON):
    return Path.cwd() / CRAWLER_OUTPUT / INTERMEDIATE_FILES / file_type / name / subpath
