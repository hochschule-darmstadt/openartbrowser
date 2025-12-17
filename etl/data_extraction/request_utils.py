"""Helper functions for requests
"""
import datetime
import time
from typing import Any, Dict, List, Optional, Tuple
from urllib.error import HTTPError

import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

from data_extraction.constants import MAX_LAG, SLEEP_TIME, TIMEOUT


def send_http_request(
    parameters: Dict,
    header: Dict,
    url: str,
    logging: Any,
    initial_timeout: Optional[int] = 0,
    items: Optional[List[str]] = None,
    abstracts: Optional[bool] = False,
    timeout: Optional[int] = TIMEOUT,
    sleep_time: Optional[int] = SLEEP_TIME,
    maxlag: Optional[int] = MAX_LAG,
) -> Dict:
    """Send a HTTP request to an endpoint

    Args:
        parameters: Dict of params
        header: HTTP header to send as dict
        url: URL of an endpoint
        logging (Logger): Logger from the calling script
        initial_timeout: Initial timeout if specific errors occur. If the timeout is exceeded the data extraction exits with an error. Defaults to 0.
        items: List of qids to extract, relevant for wikidata extraction. Defaults to empty list.
        abstracts: True if wikipedia extracts are extracted. Defaults to False.
        timeout: Seconds how long the request should wait until it times out. Defaults to TIMEOUT.
        sleep_time: How long should the process sleep until trying again. Defaults to SLEEP_TIME.
        maxlag: If the server exceeds maxlag seconds then the HTTP request should try again in maxlag seconds. Defaults to MAX_LAG.

    Returns:
        A dict containing the response from the called endpoint
    """
    if items is None:
        items = []
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
                    "Looks like not all extracts were loaded from wikipedia. Decrease the groupsize to avoid this behavior. Raising RuntimeError"
                )
                raise RuntimeError
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
        except RuntimeError as runtimeError:
            raise runtimeError
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
    retries: Optional[int] = 3,
    backoff_factor: Optional[float] = 0.3,
    status_forcelist: Optional[Tuple[int, int, int]] = (500, 502, 504),
    session: Optional[Any] = None,
) -> Any:
    """Request session with retry possibility

    Args:
        retries: Number of retries for a session. Defaults to 3.
        backoff_factor: Backoff factor for next try. Defaults to 0.3.
        status_forcelist: Retry on given status codes. Defaults to (500, 502, 504).
        session (Session): Session object. Defaults to None.

    Returns:
        Session with retry possibility

    Source:
        https://www.peterbe.com/plog/best-practice-with-retries-with-requests
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
