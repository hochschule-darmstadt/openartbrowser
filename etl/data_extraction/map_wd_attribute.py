import inspect
import re
from pathlib import Path

from data_extraction.constants import *
from pywikibot import WbTime
from shared.utils import setup_logger

# TODO Find better solution to logger import
logger = setup_logger(
    "data_extraction.map_wd_attribute",
    Path(__file__).parent.parent.absolute()
    / "logs"
    / WIKIDATA_MAP_ATTRIBUTE_LOG_FILENAME,
)


def return_on_failure(return_value):
    """
    A decorator that wraps the passed in function and logs
    exceptions should one occur

    @param return_value: The return value of func in case of an exception
    """

    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as error:
                error_message = "Error in function {0} on item {1}".format(
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
def try_get_label_or_description(entity_dict, fieldname, langkey):
    """ Method to extract the label or description """
    return entity_dict[fieldname][langkey][VALUE]


@return_on_failure("")
def try_get_wikipedia_link(entity_dict, langkey):
    return "https://{0}.wikipedia.org/wiki/{1}".format(
        langkey, entity_dict[SITELINKS][f"{langkey}wiki"]["title"].replace(" ", "_"),
    )


@return_on_failure("")
def try_get_dimension_value(entity_dict, property_id):
    return float(
        entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][AMOUNT]
    )


@return_on_failure("")
def try_get_dimension_unit(entity_dict, property_id):
    unit_qid = entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][
        UNIT
    ].replace(WIKIDATA_ENTITY_URL, "")
    is_qid = re.match(QID_PATTERN, unit_qid)
    if is_qid:
        return unit_qid
    else:
        logger.error(
            "Error on item {0}, property {1}, Unit was provided but isn't a QID reference".format(
                entity_dict[ID], property_id
            )
        )
        return ""


@return_on_failure([])
def try_get_qid_reference_list(entity_dict, property_id):
    """ Method to extract the references (which are qids) as a list """
    return list(
        map(
            lambda clm: clm[MAINSNAK][DATAVALUE][VALUE][ID],
            entity_dict[CLAIMS][property_id],
        )
    )


@return_on_failure("")
def try_get_first_value(entity_dict, property_id):
    return entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE]


@return_on_failure([])
def try_get_value_list(entity_dict, property_id):
    """ Method to extract iconclasses """
    return list(
        map(
            lambda clm: clm[MAINSNAK][DATAVALUE][VALUE],
            entity_dict[CLAIMS][property_id],
        )
    )


@return_on_failure("")
def try_get_year_from_property_timestamp(entity_dict, property_id):
    """ Method to extract the year from an inception timestamp """
    timestr = entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][TIME]
    return WbTime.fromTimestr(timestr).year


@return_on_failure("")
def try_get_first_qid(entity_dict, property_id):
    """ Method to extract the first qid """
    return entity_dict[CLAIMS][property_id][0][MAINSNAK][DATAVALUE][VALUE][ID]


@return_on_failure("no unit")
def try_get_unit_symbol(entity_dict, property_id):
    unit_symbol_entries = entity_dict[CLAIMS][property_id]
    for unit_symbol_entry in unit_symbol_entries:
        if unit_symbol_entry[MAINSNAK][DATAVALUE][VALUE]["language"] == EN:
            return unit_symbol_entry[MAINSNAK][DATAVALUE][VALUE]["text"]
