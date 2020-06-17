import re
import urllib
from itertools import islice
from typing import Any, Dict, List

from data_extraction.constants import HTTP_HEADER, MAX_LAG, WIKIDATA_API_URL
from data_extraction.request_utils import send_http_request
from shared.constants import JSON


def get_replacement_url(extracted_artwork: List[Dict], logger: Any) -> List[Dict]:
    """ For every entity replaces (if existent) the tif image url with a jpg
        thumbnail url

    Args:
        extracted_artwork: ...
        logger: ...

    Returns:
        The extracted_artwork list with replaced image urls
    """

    # Get matches
    pagetitles = [
        "File:" + re.search(r"[^/]+\.tif$", entry["image"]).group(0)
        for entry in extracted_artwork
        if (re.search(r"\.tif$", entry["image"]))
    ]

    # TODO break up into chunks of n=50

    # Leave if none found
    if not pagetitles:
        return extracted_artwork

    logger.info(f"Getting jpg replacements for {len(pagetitles)} tif images")

    # e.g. https://commons.wikimedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=400&titles=File:Scenografi_av_Christian_Jansson_-_SMV_-_DTM_1939-0648.tif
    # https://upload.wikimedia.org/wikipedia/commons/c/c0/Angono_Petroglyphs_centered.jpg (Q1637448) --> extract title from property 'image' end of str *.tif
    parameters = {
        "action": "query",
        "titles": "|".join(pagetitles),
        "format": JSON,
        "prop": "pageimages",
        "piprop": "thumbnail",
        "pithumbsize": "400",
        "maxlag": MAX_LAG,
    }

    url = WIKIDATA_API_URL
    response = send_http_request(parameters, HTTP_HEADER, url, logger,)

    return exchange_url(response, extracted_artwork)


def exchange_url(response: Dict, extracted_artwork: List[Dict]) -> List[Dict]:
    """ Goes through the wikidata response and exchanges the old image urls in
        extracted_artwork for the new thumbnail url. Replacement is based on pagetitles
        using regex+ urllib

    Args:
        response: wikidata response with new jpg thumbnail urls
        extracted_artwork: ...

    Returns:
        The extracted_artwork list with replaced image urls
    """
    # Exchange old url for new one
    # start_pos reduces unneccesarry loops, as the order of items is preserved
    start_pos = 0
    for page in response["query"]["pages"]:
        thumbnail_url = response["query"]["pages"][page]["thumbnail"]["source"]
        title = urllib.parse.unquote(
            re.search(r"(?<=px-).*\.tif", thumbnail_url).group(0)
        )

        for entry in islice(extracted_artwork, start_pos, None):
            # Match everything between 'px-' and .jpg (only match until .tif) to get the original entity title
            start_pos += 1
            if title in entry["image"]:
                entry["image"] = thumbnail_url
                break

    return extracted_artwork
