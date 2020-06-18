import re
import urllib
from typing import Dict, List
from pathlib import Path
import json

from data_extraction.constants import HTTP_HEADER, MAX_LAG, WIKIDATA_API_URL
from data_extraction.request_utils import send_http_request
from data_extraction.constants import (
    ARTWORK,
    MOTIF,
    GENRE,
    MATERIAL,
    MOVEMENT,
    ARTIST,
    LOCATION,
    PLURAL,
)
from shared.utils import chunks, create_new_path, setup_logger
from shared.constants import JSON

logger = setup_logger(
    "data_extraction.tif_substitute",
    Path(__file__).parent.parent.absolute() / "logs" / "tif_substitute.log",
)


def replace_tif_url(entity_list: List[Dict], filename: str) -> List[Dict]:
    """ For every entity replaces (if existent) the tif image url with a jpg
        thumbnail url

    Args:
        entity_list: Entity list
        filename: filename
    """

    # Get matches
    # TODO extract regex to function?
    pagetitles = [
        "File:" + re.search(r"[^/]+\.tif?f$", entitiy["image"], re.IGNORECASE).group(0)
        for entitiy in entity_list
        if (re.search(r"\.tif?f$", entitiy["image"], re.IGNORECASE))
    ]

    # Leave if none found
    if not pagetitles:
        return entity_list

    logger.info(
        f"File: {filename}, getting jpg replacements for {len(pagetitles)} tif images"
    )

    # Break up into chunks of n=50^
    # TODO retry with split chunk if chunk too big HTTP error 414
    chunk_size = 40
    item_count = 0
    full_response = []
    pagetitle_chunks = chunks(pagetitles, chunk_size)
    for chunk in pagetitle_chunks:
        # e.g. https://commons.wikimedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=400&titles=File:Scenografi_av_Christian_Jansson_-_SMV_-_DTM_1939-0648.tif
        # TODO Extract thumbsize to constants
        parameters = {
            "action": "query",
            "titles": "|".join(chunk),
            "format": JSON,
            "prop": "pageimages",
            "piprop": "thumbnail",
            "pithumbsize": "400",
            "maxlag": MAX_LAG,
        }

        url = WIKIDATA_API_URL
        response = send_http_request(parameters, HTTP_HEADER, url, logger)

        full_response.extend(list(response["query"]["pages"].values()))

        item_count += len(chunk)
        print(
            f"Status of image urls queried: {item_count}/{len(pagetitles)}",
            end="\r",
            flush=True,
        )

    print("\n", flush=True)
    return exchange_url(full_response, entity_list)


def exchange_url(response: List[Dict], entity_list: List[Dict]) -> List[Dict]:
    """ Goes through the wikidata response and exchanges the old image urls in
        extracted_artwork for the new thumbnail url. Replacement is based on pagetitles
        using regex+ urllib

    Args:
        response: wikidata response with new jpg thumbnail urls
        extracted_artwork: ...

    Returns:
        The entity_list list with replaced image urls
    """

    title_index_dict = {
        re.search(r"[^/]+\.tif?f$", entry["image"], re.IGNORECASE).group(0): num
        for num, entry in enumerate(entity_list)
        if (re.search(r"\.tif?f$", entry["image"], re.IGNORECASE))
    }

    # Exchange old url for new one
    # start_pos reduces unneccesarry loops, as the order of items is preserved
    for page in response:
        thumbnail_url = page["thumbnail"]["source"]
        try:
            title = urllib.parse.unquote(
                re.search(r"(?<=\/..\/).+(?=\/)", thumbnail_url).group(0)
            )
        except Exception as exception:
            logger.error(
                f"Skipping picture. Error with thumbnail title: {thumbnail_url}. Exception: {exception}"
            )
            continue
        if title in title_index_dict:
            entity_list[title_index_dict[title]]["image"] = thumbnail_url
        else:
            logger.error(
                f"Title {title} not found. Thumbnail url {thumbnail_url}. Maybe the link is a redirect?"
            )

    return entity_list


if __name__ == "__main__":
    for filename in [
        ARTWORK[PLURAL],
        MOTIF[PLURAL],
        GENRE[PLURAL],
        MATERIAL[PLURAL],
        MOVEMENT[PLURAL],
        ARTIST[PLURAL],
        LOCATION[PLURAL],
    ]:
        # Read in file
        print(f"Starting with {filename}")
        with open(
            (create_new_path(filename)).with_suffix(f".{JSON}"), encoding="utf-8"
        ) as file:
            # Replace urls
            new_entity_list = replace_tif_url(json.load(file), filename)
        # Overwrite file
        with open(
            (create_new_path(filename)).with_suffix(f".{JSON}"),
            "w",
            newline="",
            encoding="utf-8",
        ) as file:
            file.write(json.dumps(new_entity_list, ensure_ascii=False))

        print(f"Finished with {filename}")
