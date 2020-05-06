import json
import csv
import time
import datetime
import logging
import requests
from urllib.error import HTTPError
from pathlib import Path
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

json_file_path = Path.cwd() / "crawler_output" / "intermediate_files" / "json"


def agent_header():
    return "<nowiki>https://cai-artbrowserstaging.fbi.h-da.de/; tilo.w.michel@stud.h-da.de</nowiki>"


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def language_config_to_list(
    config_file=Path(__file__).parent.parent.absolute() / "languageconfig.csv",
):
    """Reads languageconfig.csv and returns array that contains its
    full contents

    Returns:
        list -- contents of languageconfig.csv as list
    """
    languageValues = []
    with open(config_file, encoding="utf-8") as file:
        configReader = csv.reader(file, delimiter=";")
        for row in configReader:
            if row[0] != "langkey":
                languageValues.append(row)
    return languageValues


def requests_retry_session(
    retries=3, backoff_factor=0.3, status_forcelist=(500, 502, 504), session=None,
):
    """ Request session with retry possibility
        Source: https://www.peterbe.com/plog/best-practice-with-retries-with-requests
    """
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def get_wikipedia_page_ids(
    items, indices, langkey, timeout=5, sleep_time=60, maxlag=10
):
    """ Source: https://stackoverflow.com/questions/52787504/how-to-get-page-id-from-wikipedia-page-title """
    title_indice_dictionary = {}
    wikipedia_url = f"https://{langkey}.wikipedia.org/wiki/"
    for indice in indices:
        title_indice_dictionary.update(
            {
                items[indice][f"wikipediaLink_{langkey}"].replace(
                    wikipedia_url, ""
                ): indice
            }
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
    header = {"Content-Type": "application/json", "user_agent": agent_header()}
    while True:
        try:
            t0 = time.time()
            response = requests_retry_session().get(
                f"https://{langkey}.wikipedia.org/w/api.php",
                params=parameters,
                headers=header,
                timeout=timeout,
            )
            logging.info(f"Response received {response.status_code}")
            if response.status_code == 403:
                logging.error(
                    f"The server forbid the query. Ending Crawl at {datetime.datetime.now()}. Error: {response.status_code}"
                )
                exit(-1)
            response = response.json()
            if "error" in response:
                logging.warning(
                    f"The maxlag of the server exceeded ({maxlag} seconds) waiting a minute before retry. Response: {response}"
                )
                time.sleep(sleep_time)
                continue
            else:
                break
        except HTTPError as http_error:
            logging.error(
                f"Request error. Time: {datetime.datetime.now()}. HTTP-Error: {http_error}. Following items couldn't be loaded: {title_indice_dictionary.keys()}"
            )
            time.sleep(sleep_time)
            continue
        except Exception as error:
            print(
                f"Unknown error. Time: {datetime.datetime.now()}. Error: {error}. Following items couldn't be loaded: {title_indice_dictionary.keys()}"
            )
            time.sleep(sleep_time)
            continue
        finally:
            t1 = time.time()
            logging.info(f"The request took {t1 - t0} seconds")

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
    items, page_id_index_dictionary, langkey, timeout=5, sleep_time=60, maxlag=10
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
    header = {"Content-Type": "application/json", "user_agent": agent_header()}
    while True:
        try:
            t0 = time.time()
            response = requests_retry_session().get(
                f"https://{langkey}.wikipedia.org/w/api.php",
                params=parameters,
                headers=header,
                timeout=timeout,
            )
            logging.info(f"Response received {response.status_code}")
            if response.status_code == 403:
                logging.error(
                    f"The server forbid the query. Ending Crawl at {datetime.datetime.now()}. Error: {response.status_code}"
                )
                exit(-1)
            response = response.json()
            if "batchcomplete" not in response:
                logging.error(
                    "Looks like not all extracts were loaded from wikipedia. Decrease the groupsize to avoid this behavior. Exiting script now"
                )
                exit(-1)
            if "error" in response:
                logging.warning(
                    f"The maxlag of the server exceeded ({maxlag} seconds) waiting a minute before retry. Response: {response}"
                )
                time.sleep(sleep_time)
                # retry
                continue
        except HTTPError as http_error:
            logging.error(
                f"Request error. Time: {datetime.datetime.now()}. HTTP-Error: {http_error}. Following page ids couldn't be loaded: {page_id_index_dictionary.keys()}"
            )
        except Exception as error:
            print(
                f"Unknown error. Time: {datetime.datetime.now()}. Error: {error}. Following page ids couldn't be loaded: {page_id_index_dictionary.keys()}"
            )
        finally:
            t1 = time.time()
            logging.info(f"The request took {t1 - t0} seconds")
            break

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
    languageKeys=[item[0] for item in language_config_to_list()],
):
    logging.basicConfig(
        filename="extract_wikipedia_extracts.log", filemode="w", level=logging.DEBUG
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
                item_indices_chunks = chunks(
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

        print(
            datetime.datetime.now(),
            "Finished extracting wikipedia extracts with",
            filename,
        )


if __name__ == "__main__":
    add_wikipedia_extracts()
