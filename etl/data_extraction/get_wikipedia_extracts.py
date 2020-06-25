"""Extract the wikipedia extracts for the sitelinks from wikidata

Pre-conditions:
    get_wikipedia_items.py should've been run and crawler_output/intermediate_files/json contains required files

Examples:
    python3 get_wikipedia_extract.py

Returns:
    *.json files with added attributes wikipediaLink and abstract
"""
import datetime
import json
from pathlib import Path
from typing import Optional, List, Dict

from data_extraction.constants import *
from data_extraction.request_utils import send_http_request
from shared.utils import chunks, create_new_path, language_config_to_list, setup_logger
from shared.constants import JSON


logger = setup_logger(
    "data_extraction.get_wikipedia_extracts",
    Path(__file__).parent.parent.absolute()
    / "logs"
    / GET_WIKIPEDIA_EXTRACS_LOG_FILENAME,
)

lang_keys = [item[0] for item in language_config_to_list()]


def get_wikipedia_page_ids(
    items: List[Dict],
    indices: List[int],
    langkey: str,
    timeout: Optional[int] = TIMEOUT,
    sleep_time: Optional[int] = SLEEP_TIME,
    maxlag: Optional[int] = MAX_LAG,
) -> Dict:
    """Function to get the wikipedia page ids from their label referenced in the sitelinks

    https://en.wikipedia.org/w/api.php?action=help&modules=query
    sitelink de: Mona_Lisa is resolved to

    Args:
        items: List of items
        indices: A list of indices which contain a sitelink
        langkey: A specific language key e. g. 'en'
        timeout: Timeout on the request. Defaults to TIMEOUT.
        sleep_time: Waiting time if there are serverside problems. Defaults to SLEEP_TIME.
        maxlag: Maxlag for the wikidata server see https://www.mediawiki.org/wiki/Manual:Maxlag_parameter. Defaults to MAX_LAG

    Returns:
        A dictionary which maps the wikipedia page id (which is not a qid like in wikidata) to an index in the items dictionary

    Source:
        https://stackoverflow.com/questions/52787504/how-to-get-page-id-from-wikipedia-page-title
    """
    title_indice_dictionary = {}
    wikipedia_url = f"https://{langkey}.wikipedia.org/wiki/"
    for index in indices:
        title_indice_dictionary.update(
            {
                items[index][f"{WIKIPEDIA_LINK}_{langkey}"].replace(
                    wikipedia_url, ""
                ): index
            }
        )

    parameters = {
        "action": "query",
        "format": JSON,
        "prop": "info",
        "titles": "|".join(title_indice_dictionary.keys()),
        # if the server needs more than maxlag seconds to answer
        # the query an error response is returned
        "maxlag": maxlag,
    }

    url = f"https://{langkey}.wikipedia.org/w/api.php"
    response = send_http_request(
        parameters,
        HTTP_HEADER,
        url,
        logger,
        items=title_indice_dictionary.keys(),
        timeout=TIMEOUT,
        sleep_time=SLEEP_TIME,
        maxlag=MAX_LAG,
    )

    page_normalized_titles = {x: x for x in title_indice_dictionary.keys()}

    # map index of json array to page id of wikipedia
    item_page_id_index_dictionary = {}
    if "normalized" in response["query"]:
        for mapping in response["query"]["normalized"]:
            page_normalized_titles[mapping["to"]] = mapping["from"]

    for page_id, page_info in response["query"]["pages"].items():
        normalized_title = page_info["title"]
        page_title = page_normalized_titles[normalized_title]
        index = title_indice_dictionary[page_title]
        item_page_id_index_dictionary[page_id] = index

    return item_page_id_index_dictionary


def get_wikipedia_extracts(
    items: List[Dict],
    page_id_index_dictionary: Dict,
    langkey: str,
    timeout: Optional[int] = TIMEOUT,
    sleep_time: Optional[int] = SLEEP_TIME,
    maxlag: Optional[int] = MAX_LAG,
):
    """Get the wikipedia extracts (in our data model they're called abstracts)

    https://en.wikipedia.org/w/api.php?action=help&modules=query

    Args:
        items: List of entities
        page_id_index_dictionary: Dictionary to resolve the page ids from the indices in the items list
        langkey: A specific language key e. g. 'en'
        timeout: Timeout on the request. Defaults to TIMEOUT.
        sleep_time: Waiting time if there are serverside problems. Defaults to SLEEP_TIME.
        maxlag: Maxlag for the wikidata server see https://www.mediawiki.org/wiki/Manual:Maxlag_parameter. Defaults to MAX_LAG

    Returns:
        A dictionary with index and abstract which is added to the entity of the index later

    Source:
            https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&pageids=70889|1115370
    """
    parameters = {
        "action": "query",
        "format": JSON,
        "prop": "extracts",
        "exintro": True,
        "explaintext": True,
        "pageids": "|".join(page_id_index_dictionary.keys()),
        # if the server needs more than maxlag seconds to answer
        # the query an error response is returned
        "maxlag": maxlag,
    }

    # Send HTTP-Request
    url = f"https://{langkey}.wikipedia.org/w/api.php"
    response = send_http_request(
        parameters,
        HTTP_HEADER,
        url,
        logger,
        items=page_id_index_dictionary.keys(),
        abstracts=True,
        timeout=TIMEOUT,
        sleep_time=SLEEP_TIME,
        maxlag=MAX_LAG,
    )

    index_extract_dictionary = {}
    for page_id, index in page_id_index_dictionary.items():
        if int(page_id) < 0:
            print(
                "For the wikidata item {0} there was no pageid found on the {1}.wikipedia site. Therefore the extract is set to an empty string now".format(
                    items[index]["id"], langkey
                )
            )
            # Return empty extract for those cases
            index_extract_dictionary[index] = ""
            continue
        index_extract_dictionary[index] = response["query"]["pages"][page_id]["extract"]
    return index_extract_dictionary


def add_wikipedia_extracts(language_keys: Optional[List[str]] = lang_keys,) -> None:
    """Add the wikipedia extracts to the already existing files

    Args:
        language_keys: Language keys to extract wikipedia abstracts for. Defaults to languageconfig.csv
    """
    for filename in [
        ARTWORK[PLURAL],
        MOTIF[PLURAL],
        GENRE[PLURAL],
        MATERIAL[PLURAL],
        MOVEMENT[PLURAL],
        ARTIST[PLURAL],
        LOCATION[PLURAL],
    ]:
        print(
            datetime.datetime.now(),
            "Starting extracting wikipedia extracts with",
            filename,
        )
        try:
            with open(
                (create_new_path(filename)).with_suffix(f".{JSON}"), encoding="utf-8"
            ) as file:
                items = json.load(file)
                for key in language_keys:
                    item_indices_with_wiki_link_for_lang = [
                        items.index(item)
                        for item in items
                        if item[f"{WIKIPEDIA_LINK}_{key}"] != ""
                    ]
                    print(
                        f"There are {len(item_indices_with_wiki_link_for_lang)} {key}.wikipedia links within the {len(items)} {filename} items"
                    )
                    # ToDo: The limit for extracts seems to be 20, there is an excontinue parameter which
                    # could be used to increase the performance and load more at once (50 is allowed by the API) if needed
                    # The request method has to be adjusted for this
                    # Further information https://stackoverflow.com/questions/9846795/prop-extracts-not-returning-all-extracts-in-the-wikimedia-api
                    chunk_size = 20
                    item_indices_chunks = chunks(
                        item_indices_with_wiki_link_for_lang, chunk_size
                    )
                    extracted_count = 0
                    # Fill json objects without wikilink to an abstract with empty key-value pairs (could be removed if frontend is adjusted)
                    for j in range(len(items)):
                        if j not in item_indices_with_wiki_link_for_lang:
                            items[j][f"{ABSTRACT}_{key}"] = ""

                    for chunk in item_indices_chunks:
                        # Get PageIds from URL https://en.wikipedia.org/w/api.php?action=query&titles=Jean_Wauquelin_presenting_his_'Chroniques_de_Hainaut'_to_Philip_the_Good
                        page_id_indices_dictionary = get_wikipedia_page_ids(
                            items, chunk, key
                        )
                        # Get Extracts from PageId https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&pageids=70889|1115370
                        raw_response = get_wikipedia_extracts(
                            items, page_id_indices_dictionary, key
                        )
                        # add extracted abstracts to json objects
                        for i in chunk:
                            items[i][f"{ABSTRACT}_{key}"] = raw_response[i]

                        extracted_count += len(chunk)
                        print(
                            f"Extracts for {filename} and language {key} status: {extracted_count}/{len(item_indices_with_wiki_link_for_lang)}",
                            end="\r",
                            flush=True,
                        )

            # overwrite file
            with open(
                (create_new_path(filename)).with_suffix(f".{JSON}"),
                "w",
                newline="",
                encoding="utf-8",
            ) as file:
                file.write(json.dumps(items, ensure_ascii=False))
        except Exception as error:
            print(
                f"Error when opening following file: {filename}. Error: {error}. Skipping file now."
            )
            continue
        print(
            datetime.datetime.now(),
            "Finished extracting wikipedia extracts with",
            filename,
        )


if __name__ == "__main__":
    add_wikipedia_extracts()
