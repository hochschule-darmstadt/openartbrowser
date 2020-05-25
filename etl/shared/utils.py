import csv
import pkgutil
import logging


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


def setup_logger(logger_name, filename):
    """Setup a logger for a python script.

    Args:
        logger_name (str): Package + module name e.g. 'data_extraction.get_wikidata_items'
        filename (str): String to the path and file the logger writes to

    Returns:
        Logger object
    """
    logging.basicConfig(
        filename=filename,
        filemode="w",
        level=logging.DEBUG,
        format="%(asctime)s %(name)-12s %(levelname)-8s %(message)s",
        datefmt="%d.%m.%Y %H:%M",
    )

    logger = logging.getLogger(logger_name)
    console = logging.StreamHandler()
    console.setLevel(logging.WARNING)  # Print warnings and errors to console
    formatter = logging.Formatter("%(name)-12s: %(levelname)-8s %(message)s")
    console.setFormatter(formatter)
    logger.addHandler(console)
    return logger


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]
