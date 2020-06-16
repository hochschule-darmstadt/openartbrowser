import re
import urllib
from itertools import islice
from typing import Any, Dict, List, Optional

from data_extraction.constants import (
    HTTP_HEADER,
    MAX_LAG,
    SLEEP_TIME,
    TIMEOUT,
    WIKIDATA_API_URL,
)
from data_extraction.request_utils import send_http_request
from shared.constants import JSON


def get_replacement_url(
    extracted_artwork: List[Dict],
    logger: Any,
    timeout: Optional[int] = TIMEOUT,
    sleep_time: Optional[int] = SLEEP_TIME,
    maxlag: Optional[int] = MAX_LAG,
) -> List[Dict]:
    # TODO add logging text
    # Get matches
    pagetitles = [
        "File:" + re.search(r"[^/]+\.tif$", entry["image"]).group(0)
        for entry in extracted_artwork
        if (re.search(r"\.tif$", entry["image"]))
    ]

    # Leave if none found
    if not pagetitles:
        return extracted_artwork

    # e.g. https://commons.wikimedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=400&titles=File:Scenografi_av_Christian_Jansson_-_SMV_-_DTM_1939-0648.tif
    # https://upload.wikimedia.org/wikipedia/commons/c/c0/Angono_Petroglyphs_centered.jpg (Q1637448) --> extract title from property 'image' end of str *.tif
    initial_timeout = timeout
    parameters = {
        "action": "query",
        "titles": "|".join(pagetitles),
        "format": JSON,
        "prop": "pageimages",
        "piprop": "thumbnail",
        "pithumbsize": "400",
        "maxlag": maxlag,
    }

    url = WIKIDATA_API_URL
    response = send_http_request(
        parameters,
        HTTP_HEADER,
        url,
        logger,
        initial_timeout=initial_timeout,
        # items=qids,
        timeout=timeout,
        sleep_time=sleep_time,
        maxlag=maxlag,
    )

    # TODO extract nested dict access to map_wd_attribute.py
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
