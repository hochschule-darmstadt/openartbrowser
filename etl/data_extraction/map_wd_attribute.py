"""Mapping functions to extract information from wikidata JSON responses (especially entity attribtues) to the openArtBrowser data model
"""
import inspect
import re
from pathlib import Path
from typing import Any, Callable, Dict, List

from pywikibot import WbTime

from data_extraction.constants import *
from shared.utils import setup_logger

logger = setup_logger(
    "data_extraction.map_wd_attribute",
    Path(__file__).parent.parent.absolute()
    / "logs"
    / WIKIDATA_MAP_ATTRIBUTE_LOG_FILENAME,
)


def get_attribute_values_with_try_get_func(
    entity_dict: Dict,
    attribute_list: List,
    oab_type: str,
    try_get_func: Callable[[Dict, str, str, str], Any],
) -> Any:
    """Higher order function for map_wd_attribute function to bundle calls in for-loops

    Args:
        result: JSON response from wikidata
        attribute_list: attributes to extract with function
        oab_type: type name which is extracted
        try_get_func: try get function

    Yields:
        Value of a try get function
    """
    for item in attribute_list:
        yield try_get_func(entity_dict, PROPERTY_NAME_TO_PROPERTY_ID[item], oab_type)


def return_on_failure(return_value) -> Any:
    """A decorator that wraps a function and logs exceptions

    Args:
        return_value: The return value of func in case of an exception

    Examples:
        @return_on_failure("")
        def try_get_label_or_description(entity_dict: Dict, fieldname: str, langkey: str, oab_type: str) -> str:
    """

    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as error:
                error_message = "Missing attribute in function {0} on item {1}".format(
                    func.__name__, args[0][ID]
                )
                # iterate over argument names
                # splice the array to skip the first argument and start at index 1
                for index, param in enumerate(inspect.getfullargspec(func)[0][1:], 1):
                    error_message += ", {0} {1}".format(param, args[index])
                error_message += ", error {0}".format(error)
                logger.info(error_message)

                return return_value

        return wrapper

    return decorator


@return_on_failure("")
def try_get_label_or_description(
    entity_dict: Dict, fieldname: str, langkey: str, oab_type: str
) -> str:
    """Function for extracting the label or description from a wikidata response

    Args:
        entity_dict: JSON response from wikidata
        fieldname: Fieldname which is either 'label' or 'description'
        langkey: ISO 639-1 language code e. g. 'en'
        oab_type: openArtBrowser type e. g. 'artwork', 'motif' important for logging

    Returns:
        Value of either a label or a description from the wikidata response
    """
    return entity_dict[fieldname][langkey][VALUE]


@return_on_failure("")
def try_get_wikipedia_link(entity_dict: Dict, langkey: str, oab_type: str) -> str:
    """Function for extracting the wikipedia link from a wikidata response

    Args:
        entity_dict: JSON response from wikidata
        langkey: ISO 639-1 language code e. g. 'en'
        oab_type: openArtBrowser type e. g. 'artwork', 'motif' important for logging

    Returns:
        Wikipedia URL from wikidata response
    """
    return "https://{0}.wikipedia.org/wiki/{1}".format(
        langkey, entity_dict[SITELINKS][f"{langkey}wiki"]["title"].replace(" ", "_"),
    )


@return_on_failure("")
def try_get_dimension_value(
    entity_dict: Dict, property_id: str, oab_type: str
) -> float:  # Possible error
    """Function for extracting the unit value from a wikidata response

    Args:
        entity_dict: JSON response from wikidata
        property_id: Wikidata property id e. g. 'P18' stands for the property image
        oab_type: openArtBrowser type e. g. 'artwork', 'motif' important for logging

    Returns:
        Value for a dimension e. g. 1.4
    """
    return float(
        entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][AMOUNT]
    )


@return_on_failure("")
def try_get_dimension_unit(entity_dict: Dict, property_id: str, oab_type: str) -> str:
    """Function for extracting the unit from a wikidata response

    Args:
        entity_dict: JSON response from wikidata
        property_id: Wikidata property id e. g. 'P18' stands for the property image
        oab_type: openArtBrowser type e. g. 'artwork', 'motif' important for logging

    Returns:
        Qid of one unit
    """
    unit_qid = entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][
        UNIT
    ].replace(WIKIDATA_ENTITY_URL, "")
    is_qid = re.match(
        QID_PATTERN, unit_qid
    )  # This regex check is necessary, we had references with wrong format
    if is_qid:
        return unit_qid
    else:
        logger.error(
            "Missing attribute on item {0}, property {1}, Unit was provided but isn't a QID reference".format(
                entity_dict[ID], property_id
            )
        )
        return ""


@return_on_failure([])
def try_get_qid_reference_list(
    entity_dict: Dict, property_id: str, oab_type: str
) -> List[str]:
    """Function for extracting the references (qids) as a list

    Args:
        entity_dict: JSON response from wikidata
        property_id: Wikidata property id e. g. 'P18' stands for the property image
        oab_type: openArtBrowser type e. g. 'artwork', 'motif' important for logging

    Returns:
        List of qid strings for the given property id
    """
    return list(
        set(  # Use a set to avoid duplicates in the references
            map(
                lambda clm: clm[MAINSNAK][DATAVALUE][VALUE][ID],
                entity_dict[CLAIMS][property_id],
            )
        )
    )


@return_on_failure("")
def try_get_first_value(entity_dict: Dict, property_id: str, oab_type: str) -> str:
    """Function for extracting the first value of a property id

    Args:
        entity_dict: JSON response from wikidata
        property_id: Wikidata property id e. g. 'P18' stands for the property image
        oab_type: openArtBrowser type e. g. 'artwork', 'motif' important for logging

    Returns:
        First value for the given property id
    """
    return entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE]


@return_on_failure([])
def try_get_value_list(entity_dict: Dict, property_id: str, oab_type: str) -> List[str]:
    """Function for extracting a value list

    Args:
        entity_dict: JSON response from wikidata
        property_id: Wikidata property id e. g. 'P18' stands for the property image
        oab_type: openArtBrowser type e. g. 'artwork', 'motif' important for logging

    Returns:
        List of values for the given property ids
    """
    return list(
        map(
            lambda clm: clm[MAINSNAK][DATAVALUE][VALUE],
            entity_dict[CLAIMS][property_id],
        )
    )


@return_on_failure("")
def try_get_year_from_property_timestamp(
    entity_dict: Dict, property_id: str, oab_type: str
) -> int:
    """Function for extracting the year from an inception timestamp

    Args:
        entity_dict: JSON response from wikidata
        property_id: Wikidata property id e. g. 'P18' stands for the property image
        oab_type: openArtBrowser type e. g. 'artwork', 'motif' important for logging

    Returns:
        Year from timestamp
    """
    timestr = entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][TIME]
    return WbTime.fromTimestr(timestr).year


@return_on_failure("")
def try_get_first_qid(entity_dict: Dict, property_id: str, oab_type: str) -> str:
    """Function for extracting the first qid

    Args:
        entity_dict: JSON response from wikidata
        property_id: Wikidata property id e. g. 'P18' stands for the property image
        oab_type: openArtBrowser type e. g. 'artwork', 'motif' important for logging

    Returns:
        First qid from JSON response
    """
    return entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][ID]


@return_on_failure("no unit")
def try_get_unit_symbol(entity_dict: Dict, property_id: str, oab_type: str) -> str:
    """Function for extracting the unit symbol from a unit entity

    Args:
        entity_dict: JSON response from wikidata
        property_id: Wikidata property id e. g. 'P18' stands for the property image
        oab_type: openArtBrowser type e. g. 'artwork', 'motif' important for logging

    Returns:
        Unit symbol
    """
    unit_symbol_entries = entity_dict[CLAIMS][property_id]
    for unit_symbol_entry in unit_symbol_entries:
        if unit_symbol_entry[MAINSNAK][DATAVALUE][VALUE]["language"] == EN:
            return unit_symbol_entry[MAINSNAK][DATAVALUE][VALUE]["text"]
