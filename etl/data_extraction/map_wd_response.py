"""Functions to map a wikidata entity response to an openArtBrowser model"""

from pathlib import Path
from typing import Dict, List, Optional

import data_extraction.map_wd_attribute as map_wd_attribute
from data_extraction import constants as cnst
from shared.utils import language_config_to_list, setup_logger

logger = setup_logger(
    "data_extraction.map_wd_response",
    Path(__file__).parent.parent.absolute() / "logs" / cnst.WIKIDATA_MAP_RESPONSE_LOG_FILENAME,
)

lang_keys = [item[0] for item in language_config_to_list()]


def try_map_response_to_subject(
    response: Dict,
    type_name: str,
    language_keys: Optional[List[str]] = lang_keys,
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
        qid = response[cnst.ID]
    except Exception as error:
        logger.error("Error on qid, skipping item. Error: {0}".format(error))
        return None

    # How to get image url
    # https://stackoverflow.com/questions/34393884/how-to-get-image-url-property-from-wikidata-item-by-api
    try:
        image = map_wd_attribute.get_image_url_by_name(
            response[cnst.CLAIMS][cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.IMAGE]][0][cnst.MAINSNAK][cnst.DATAVALUE][
                cnst.VALUE
            ]
        )
    except Exception as e:
        logger.error(e)
        image = ""

    label = map_wd_attribute.try_get_label_or_description(response, cnst.LABEL[cnst.PLURAL], cnst.EN, type_name)
    description = map_wd_attribute.try_get_label_or_description(
        response, cnst.DESCRIPTION[cnst.PLURAL], cnst.EN, type_name
    )
    classes = map_wd_attribute.try_get_qid_reference_list(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.CLASS[cnst.SINGULAR]], type_name
    )

    subject_dict = {
        cnst.ID: qid,
        cnst.CLASS[cnst.PLURAL]: classes,
        cnst.LABEL[cnst.SINGULAR]: label,
        cnst.DESCRIPTION[cnst.SINGULAR]: description,
        cnst.IMAGE: image,
        cnst.TYPE: type_name,
    }

    for langkey in language_keys:
        label_lang = map_wd_attribute.try_get_label_or_description(
            response, cnst.LABEL[cnst.PLURAL], langkey, type_name
        )
        description_lang = map_wd_attribute.try_get_label_or_description(
            response, cnst.DESCRIPTION[cnst.PLURAL], langkey, type_name
        )
        wikipedia_link_lang = map_wd_attribute.try_get_wikipedia_link(response, langkey, type_name)
        subject_dict.update(
            {
                f"{cnst.LABEL[cnst.SINGULAR]}_{langkey}": label_lang,
                f"{cnst.DESCRIPTION[cnst.SINGULAR]}_{langkey}": description_lang,
                f"{cnst.WIKIPEDIA_LINK}_{langkey}": wikipedia_link_lang,
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
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.GENDER], cnst.ARTIST[cnst.SINGULAR]
    )
    date_of_birth = map_wd_attribute.try_get_year_from_property_timestamp(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.DATE_OF_BIRTH], cnst.ARTIST[cnst.SINGULAR]
    )
    date_of_death = map_wd_attribute.try_get_year_from_property_timestamp(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.DATE_OF_DEATH], cnst.ARTIST[cnst.SINGULAR]
    )
    # labels to be resolved later
    place_of_birth = map_wd_attribute.try_get_first_qid(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.PLACE_OF_BIRTH], cnst.ARTIST[cnst.SINGULAR]
    )
    # labels to be resolved later
    place_of_death = map_wd_attribute.try_get_first_qid(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.PLACE_OF_DEATH], cnst.ARTIST[cnst.SINGULAR]
    )
    # labels to be resolved later
    citizenship = map_wd_attribute.try_get_first_qid(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.CITIZENSHIP], cnst.ARTIST[cnst.SINGULAR]
    )
    movements = map_wd_attribute.try_get_qid_reference_list(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.MOVEMENT[cnst.SINGULAR]], cnst.ARTIST[cnst.SINGULAR]
    )
    return {
        cnst.GENDER: gender,
        cnst.DATE_OF_BIRTH: date_of_birth,
        cnst.DATE_OF_DEATH: date_of_death,
        cnst.PLACE_OF_BIRTH: place_of_birth,
        cnst.PLACE_OF_DEATH: place_of_death,
        cnst.CITIZENSHIP: citizenship,
        cnst.MOVEMENT[cnst.PLURAL]: movements,
    }


def try_map_response_to_movement(response: Dict) -> Dict:
    """Maps the oab movement attributes from the wikidata entity to the movement entity

    Args:
        response: wikidata entity to map to an oab entity

    Returns:
        A dict of an movement entity
    """
    start_time = map_wd_attribute.try_get_year_from_property_timestamp(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.START_TIME], cnst.MOVEMENT[cnst.SINGULAR]
    )
    end_time = map_wd_attribute.try_get_year_from_property_timestamp(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.END_TIME], cnst.MOVEMENT[cnst.SINGULAR]
    )
    # labels to be resolved later
    country = map_wd_attribute.try_get_first_qid(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.COUNTRY], cnst.MOVEMENT[cnst.SINGULAR]
    )
    has_part = map_wd_attribute.try_get_qid_reference_list(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.HAS_PART], cnst.MOVEMENT[cnst.SINGULAR]
    )
    part_of = map_wd_attribute.try_get_qid_reference_list(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.PART_OF], cnst.MOVEMENT[cnst.SINGULAR]
    )
    return {
        cnst.START_TIME: start_time,
        cnst.END_TIME: end_time,
        cnst.COUNTRY: country,
        cnst.HAS_PART: has_part,
        cnst.PART_OF: part_of,
    }


def try_map_response_to_location(response):
    """Maps the oab location attributes from the wikidata entity to the location entity

    Args:
        response: wikidata entity to map to an oab entity

    Returns:
        A dict of an location entity
    """
    country = map_wd_attribute.try_get_first_qid(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.COUNTRY], cnst.LOCATION[cnst.SINGULAR]
    )
    website = map_wd_attribute.try_get_first_value(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.WEBSITE], cnst.LOCATION[cnst.SINGULAR]
    )
    part_of = map_wd_attribute.try_get_qid_reference_list(
        response, cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.PART_OF], cnst.LOCATION[cnst.SINGULAR]
    )
    try:
        coordinate = response[cnst.CLAIMS][cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.COORDINATE]][0][cnst.MAINSNAK][
            cnst.DATAVALUE
        ][cnst.VALUE]
        lat = coordinate[cnst.LATITUDE[cnst.SINGULAR]]
        lon = coordinate[cnst.LONGITUDE[cnst.SINGULAR]]
    except Exception as error:
        logger.info(
            "Error on item {0}, property {1}, type {2}, error {3}".format(
                response[cnst.ID],
                cnst.PROPERTY_NAME_TO_PROPERTY_ID[cnst.COORDINATE],
                cnst.LOCATION[cnst.SINGULAR],
                error,
            )
        )
        lat = ""
        lon = ""
    return {
        cnst.COUNTRY: country,
        cnst.WEBSITE: website,
        cnst.PART_OF: part_of,
        cnst.LATITUDE[cnst.ABBREVIATION]: lat,
        cnst.LONGITUDE[cnst.ABBREVIATION]: lon,
    }
