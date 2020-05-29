import datetime
import time
from urllib.error import HTTPError

import requests
from data_extraction.constants import MAX_LAG, SLEEP_TIME, TIMEOUT
from requests.adapters import HTTPAdapter
from urllib3.util import Retry


def send_http_request(
    parameters,
    header,
    url,
    logging,
    initial_timeout=0,
    items=[],
    abstracts=False,
    timeout=TIMEOUT,
    sleep_time=SLEEP_TIME,
    maxlag=MAX_LAG,
):
    while True:
        try:
            t0 = time.time()
            response = requests_retry_session().get(
                url, params=parameters, headers=header, timeout=timeout,
            )
            logging.info(f"Response received {response.status_code}")
            if response.status_code == 403:
                logging.error(
                    f"The server forbid the query. Ending Crawl at {datetime.datetime.now()}. Error: {response.status_code}"
                )
                exit(-1)
            response = response.json()
            if abstracts and "batchcomplete" not in response:
                logging.error(
                    "Looks like not all extracts were loaded from wikipedia. Decrease the groupsize to avoid this behavior. Exiting script now"
                )
                exit(-1)
            if "error" in response:
                # ToDo: more specific error handling since unknown ids error throws a different message
                print(
                    f"The maxlag of the server exceeded ({maxlag} seconds) waiting a minute before retry. Response: {response}",
                    flush=True,
                )
                time.sleep(sleep_time)
                continue
            else:
                break  # wenn die response richtig aussieht dann aus der schleife springen
        except HTTPError as http_error:
            logging.error(
                f"Request error. Time: {datetime.datetime.now()}. HTTP-Error: {http_error}. Following items couldn't be loaded: {items}"
            )
            time.sleep(sleep_time)
            sleep_time *= 2  # increase sleep time if this happens again
            continue
        except NameError as nameError:
            logging.error(
                f"Request error. Time: {datetime.datetime.now()}. Name-Error: {nameError}. Following items couldn't be loaded: {items}"
            )
            logging.error(
                "The request's response wasn't defined. Something went wrong (see above). Sleeping for one minute and doubling the timeout. After that retry the request"
            )
            time.sleep(sleep_time)
            timeout *= 2
            if timeout >= initial_timeout * 8:
                logging.error(
                    "The server doesn't respond to this request. Skipping chunk"
                )
                return ""
            else:
                continue
        except Exception as error:
            print(
                f"Unknown error. Time: {datetime.datetime.now()}. Error: {error}. Following items couldn't be loaded: {items}"
            )
            time.sleep(sleep_time)
            continue

        finally:
            t1 = time.time()
            logging.info(f"The request took {t1 - t0} seconds")

    return response


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
