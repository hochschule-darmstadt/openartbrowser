"""Shared util functions across all python scripts
"""
import csv
import json
import logging
import os
import pkgutil
from pathlib import Path
from typing import Dict, List

from shared.constants import CRAWLER_OUTPUT, INTERMEDIATE_FILES, LOGS, JSON, ETL_STATES

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
        yield lst[i: i + n]


def create_new_path(name, subpath="", file_type=JSON):
    return Path.cwd() / CRAWLER_OUTPUT / INTERMEDIATE_FILES / file_type / name / subpath


def write_state(state, parent_path=None):
    path = (parent_path if parent_path else Path.cwd()) / LOGS / ETL_STATES.FILENAME
    append_write = 'a' if os.path.exists(path) else 'w+'  # check if file exists, create if not
    try:
        with open(path, append_write, newline='') as file:
            file.write(f'\n{state}')
    except Exception as e:
        print(e)


def check_state(state, parent_path=None):
    path = (parent_path if parent_path else Path.cwd()) / LOGS / ETL_STATES.FILENAME
    if not os.path.exists(path):
        return False
    try:
        with open(path, "r") as file:
            for line in file:
                if line[:-1] == state:
                    print(f"State {state} recovered")
                    return True
        return False
    except Exception as e:
        print(e)


def is_jsonable(x):
    try:
        json.dumps(x)
        return True
    except (TypeError, OverflowError):
        return False


def generate_json(extract_dicts: List[Dict], filename: str) -> None:
    """Generates a JSON file from a dictionary

    Args:
        extract_dicts: List of dicts that containing wikidata entities transformed to oab entities
        filename: Name of the file to write the data to
    """
    if len(extract_dicts) == 0:
        return
    filename.parent.mkdir(parents=True, exist_ok=True)
    with open(
            filename.with_suffix(f".{JSON}"), "w", newline="", encoding="utf-8"
    ) as file:
        json.dump(extract_dicts, file, skipkeys=True, ensure_ascii=False)
