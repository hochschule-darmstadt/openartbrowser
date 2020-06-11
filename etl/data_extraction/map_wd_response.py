"""Functions to map a wikidata entity response to an openArtBrowser model
"""

from pathlib import Path
from typing import List, Dict, Optional

import data_extraction.map_wd_attribute as map_wd_attribute
from data_extraction.constants import *
from data_extraction.get_wikidata_items import get_image_url_by_name
from shared.utils import language_config_to_list, setup_logger


logger = setup_logger(
    "data_extraction.map_wd_response",
    Path(__file__).parent.parent.absolute()
    / "logs"
    / WIKIDATA_MAP_RESPONSE_LOG_FILENAME,
)

lang_keys = [item[0] for item in language_config_to_list()]


def try_map_response_to_subject(
    response: Dict, type_name: str, language_keys: Optional[List[str]] = lang_keys,
) -> Dict:
    """Maps the default attributes which every subject has:
    qid, image, label, description, classes, wikipediaLink (including language specific attributes)

    Args:
        response: The wikidata entity which should be mapped to an openArtBrowser entity
        type_name: Type name of the entity
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv

    Returns:
        A dict of an openArtBrowser entity
    """
    try:
        qid = response[ID]
    except Exception as error:
        logger.error("Error on qid, skipping item. Error: {0}".format(error))
        return None

    # How to get image url
    # https://stackoverflow.com/questions/34393884/how-to-get-image-url-property-from-wikidata-item-by-api
    try:
        image = get_image_url_by_name(
            response[CLAIMS][PROPERTY_NAME_TO_PROPERTY_ID[IMAGE]][0][MAINSNAK][
                DATAVALUE
            ][VALUE]
        )
    except:
        image = ""

    label = map_wd_attribute.try_get_label_or_description(
        response, LABEL[PLURAL], EN, type_name
    )
    description = map_wd_attribute.try_get_label_or_description(
        response, DESCRIPTION[PLURAL], EN, type_name
    )
    classes = map_wd_attribute.try_get_qid_reference_list(
        response, PROPERTY_NAME_TO_PROPERTY_ID[CLASS[SINGULAR]], type_name
    )

    subject_dict = {
        ID: qid,
        CLASS[PLURAL]: classes,
        LABEL[SINGULAR]: label,
        DESCRIPTION[SINGULAR]: description,
        IMAGE: image,
    }

    for langkey in language_keys:
        label_lang = map_wd_attribute.try_get_label_or_description(
            response, LABEL[PLURAL], langkey, type_name
        )
        description_lang = map_wd_attribute.try_get_label_or_description(
            response, DESCRIPTION[PLURAL], langkey, type_name
        )
        wikipedia_link_lang = map_wd_attribute.try_get_wikipedia_link(
            response, langkey, type_name
        )
        subject_dict.update(
            {
                f"{LABEL[SINGULAR]}_{langkey}": label_lang,
                f"{DESCRIPTION[SINGULAR]}_{langkey}": description_lang,
                f"{WIKIPEDIA_LINK}_{langkey}": wikipedia_link_lang,
            }
        )

    return subject_dict


def try_map_response_to_artist(response: Dict) -> Dict:
    """Maps the oab artist attributes from the wikidata entity to the artist entity

    Args:
        response: wikidata entity to map to an oab entity

    Returns:
        A dict of an artist entity
    """
    gender = map_wd_attribute.try_get_first_qid(
        response, PROPERTY_NAME_TO_PROPERTY_ID[GENDER], ARTIST[SINGULAR]
    )
    date_of_birth = map_wd_attribute.try_get_year_from_property_timestamp(
        response, PROPERTY_NAME_TO_PROPERTY_ID[DATE_OF_BIRTH], ARTIST[SINGULAR]
    )
    date_of_death = map_wd_attribute.try_get_year_from_property_timestamp(
        response, PROPERTY_NAME_TO_PROPERTY_ID[DATE_OF_DEATH], ARTIST[SINGULAR]
    )
    # labels to be resolved later
    place_of_birth = map_wd_attribute.try_get_first_qid(
        response, PROPERTY_NAME_TO_PROPERTY_ID[PLACE_OF_BIRTH], ARTIST[SINGULAR]
    )
    # labels to be resolved later
    place_of_death = map_wd_attribute.try_get_first_qid(
        response, PROPERTY_NAME_TO_PROPERTY_ID[PLACE_OF_DEATH], ARTIST[SINGULAR]
    )
    # labels to be resolved later
    citizenship = map_wd_attribute.try_get_first_qid(
        response, PROPERTY_NAME_TO_PROPERTY_ID[CITIZENSHIP], ARTIST[SINGULAR]
    )
    movements = map_wd_attribute.try_get_qid_reference_list(
        response, PROPERTY_NAME_TO_PROPERTY_ID[MOVEMENT[SINGULAR]], ARTIST[SINGULAR]
    )
    return {
        GENDER: gender,
        DATE_OF_BIRTH: date_of_birth,
        DATE_OF_DEATH: date_of_death,
        PLACE_OF_BIRTH: place_of_birth,
        PLACE_OF_DEATH: place_of_death,
        CITIZENSHIP: citizenship,
        MOVEMENT[PLURAL]: movements,
    }


def try_map_response_to_movement(response: Dict) -> Dict:
    """Maps the oab movement attributes from the wikidata entity to the movement entity

    Args:
        response: wikidata entity to map to an oab entity

    Returns:
        A dict of an movement entity
    """
    start_time = map_wd_attribute.try_get_year_from_property_timestamp(
        response, PROPERTY_NAME_TO_PROPERTY_ID[START_TIME], MOVEMENT[SINGULAR]
    )
    end_time = map_wd_attribute.try_get_year_from_property_timestamp(
        response, PROPERTY_NAME_TO_PROPERTY_ID[END_TIME], MOVEMENT[SINGULAR]
    )
    # labels to be resolved later
    country = map_wd_attribute.try_get_first_qid(
        response, PROPERTY_NAME_TO_PROPERTY_ID[COUNTRY], MOVEMENT[SINGULAR]
    )
    has_part = map_wd_attribute.try_get_qid_reference_list(
        response, PROPERTY_NAME_TO_PROPERTY_ID[HAS_PART], MOVEMENT[SINGULAR]
    )
    part_of = map_wd_attribute.try_get_qid_reference_list(
        response, PROPERTY_NAME_TO_PROPERTY_ID[PART_OF], MOVEMENT[SINGULAR]
    )
    return {
        START_TIME: start_time,
        END_TIME: end_time,
        COUNTRY: country,
        HAS_PART: has_part,
        PART_OF: part_of,
    }


def try_map_response_to_location(response):
    """Maps the oab location attributes from the wikidata entity to the location entity

    Args:
        response: wikidata entity to map to an oab entity

    Returns:
        A dict of an location entity
    """
    country = map_wd_attribute.try_get_first_qid(
        response, PROPERTY_NAME_TO_PROPERTY_ID[COUNTRY], LOCATION[SINGULAR]
    )
    website = map_wd_attribute.try_get_first_value(
        response, PROPERTY_NAME_TO_PROPERTY_ID[WEBSITE], LOCATION[SINGULAR]
    )
    part_of = map_wd_attribute.try_get_qid_reference_list(
        response, PROPERTY_NAME_TO_PROPERTY_ID[PART_OF], LOCATION[SINGULAR]
    )
    try:
        coordinate = response[CLAIMS][PROPERTY_NAME_TO_PROPERTY_ID[COORDINATE]][0][
            MAINSNAK
        ][DATAVALUE][VALUE]
        lat = coordinate[LATITUDE[SINGULAR]]
        lon = coordinate[LONGITUDE[SINGULAR]]
    except Exception as error:
        logger.info(
            "Error on item {0}, property {1}, type {2}, error {3}".format(
                response[ID],
                PROPERTY_NAME_TO_PROPERTY_ID[COORDINATE],
                LOCATION[SINGULAR],
                error,
            )
        )
        lat = ""
        lon = ""
    return {
        COUNTRY: country,
        WEBSITE: website,
        PART_OF: part_of,
        LATITUDE[ABBREVIATION]: lat,
        LONGITUDE[ABBREVIATION]: lon,
    }
