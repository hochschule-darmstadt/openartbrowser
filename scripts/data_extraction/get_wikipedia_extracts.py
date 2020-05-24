import datetime
import json
import logging
from pathlib import Path

import utils.open_art_browser_constants as constant
import utils.request_utils as request_utils
import utils.util_funcs as util_funcs

json_file_path = Path.cwd() / "crawler_output" / "intermediate_files" / "json"


def get_wikipedia_page_ids(
    items,
    indices,
    langkey,
    timeout=constant.TIMEOUT,
    sleep_time=constant.SLEEP_TIME,
    maxlag=constant.MAX_LAG,
):
    """ Source: https://stackoverflow.com/questions/52787504/how-to-get-page-id-from-wikipedia-page-title """
    title_indice_dictionary = {}
    wikipedia_url = f"https://{langkey}.wikipedia.org/wiki/"
    for index in indices:
        title_indice_dictionary.update(
            {items[index][f"wikipediaLink_{langkey}"].replace(wikipedia_url, ""): index}
        )

    parameters = {
        "action": "query",
        "format": "json",
        "prop": "info",
        "titles": "|".join(title_indice_dictionary.keys()),
        # if the server needs more than maxlag seconds to answer
        # the query an error response is returned
        "maxlag": maxlag,
    }

    url = f"https://{langkey}.wikipedia.org/w/api.php"
    response = request_utils.send_http_request(
        parameters,
        constant.HTTP_HEADER,
        url,
        logging,
        items=title_indice_dictionary.keys(),
        timeout=timeout,
        sleep_time=sleep_time,
        maxlag=maxlag,
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
    items,
    page_id_index_dictionary,
    langkey,
    timeout=constant.TIMEOUT,
    sleep_time=constant.SLEEP_TIME,
    maxlag=constant.MAX_LAG,
):
    """ https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&pageids=70889|1115370 """
    parameters = {
        "action": "query",
        "format": "json",
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
    response = request_utils.send_http_request(
        parameters,
        constant.HTTP_HEADER,
        url,
        logging,
        items=page_id_index_dictionary.keys(),
        abstracts=True,
        timeout=timeout,
        sleep_time=sleep_time,
        maxlag=maxlag,
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


def add_wikipedia_extracts(
    languageKeys=[item[0] for item in util_funcs.language_config_to_list()],
):
    logging.basicConfig(
        filename="get_wikipedia_extracts.log", filemode="w", level=logging.DEBUG
    )
    for filename in [
        "artworks",
        "motifs",
        "genres",
        "materials",
        "movements",
        "artists",
        "locations",
    ]:
        print(
            datetime.datetime.now(),
            "Starting extracting wikipedia extracts with",
            filename,
        )
        try:
            with open(
                (json_file_path / filename).with_suffix(".json"), encoding="utf-8"
            ) as file:
                items = json.load(file)
                for key in languageKeys:
                    item_indices_with_wiki_link_for_lang = [
                        items.index(item)
                        for item in items
                        if item[f"wikipediaLink_{key}"] != ""
                    ]
                    print(
                        f"There are {len(item_indices_with_wiki_link_for_lang)} {key}.wikipedia links within the {len(items)} {filename} items"
                    )
                    # ToDo: The limit for extracts seems to be 20, there is an excontinue parameter which
                    # could be used to increase the performance and load more at once (50 is allowed by the API) if needed
                    # The request method has to be adjusted for this
                    # Further information https://stackoverflow.com/questions/9846795/prop-extracts-not-returning-all-extracts-in-the-wikimedia-api
                    chunk_size = 20
                    item_indices_chunks = util_funcs.chunks(
                        item_indices_with_wiki_link_for_lang, chunk_size
                    )
                    extracted_count = 0
                    # Fill json objects without wikilink to an abstract with empty key-value pairs (could be removed if frontend is adjusted)
                    for j in range(len(items)):
                        if j not in item_indices_with_wiki_link_for_lang:
                            items[j][f"abstract_{key}"] = ""

                    for chunk in item_indices_chunks:
                        # Get PageIds from URL https://en.wikipedia.org/w/api.php?action=query&titles=Jean_Wauquelin_presenting_his_'Chroniques_de_Hainaut'_to_Philip_the_Good
                        page_id_indices_dictionary = get_wikipedia_page_ids(
                            items, chunk, key
                        )
                        # Get Extracts from PageId https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&pageids=70889|1115370
                        rawResponse = get_wikipedia_extracts(
                            items, page_id_indices_dictionary, key
                        )
                        # add extracted abstracts to json objects
                        for i in chunk:
                            items[i][f"abstract_{key}"] = rawResponse[i]

                        extracted_count += len(chunk)
                        print(
                            f"Extracts for {filename} and language {key} status: {extracted_count}/{len(item_indices_with_wiki_link_for_lang)}"
                        )

            # overwrite file
            with open(
                (json_file_path / filename).with_suffix(".json"),
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
