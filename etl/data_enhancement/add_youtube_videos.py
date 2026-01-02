"""Adds the youtube video links to the art_ontology.json

Pre-conditions:
    The art_ontology.json file has to be existing

Examples:
    python3 add_youtube_videos.py

    # check for valid youtube ids
    python3 add_youtube_videos.py -c

Returns:
    Modified version of the art_ontology.json with youtube video links
"""

import csv
import datetime
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional

import requests

from shared.constants import (
    ADD_YOUTUBE_VIDEOS_LOG_FILENAME,
    ARTIST,
    ARTWORK,
    ETL_STATES,
    ID,
    JSON,
    MOVEMENT,
    PLURAL,
    VIDEOS,
    YOUTUBE_VIDEOS_FILE,
)
from shared.utils import check_state, create_new_path, setup_logger, write_state

# setup logger
logger = setup_logger(
    "data_enhancement.add_youtube_videos",
    Path(__file__).parent.parent.absolute() / "logs" / ADD_YOUTUBE_VIDEOS_LOG_FILENAME,
)

try:
    GOOGLE_DEV_KEY = open("google_dev_key.txt").read()
except FileNotFoundError:
    GOOGLE_DEV_KEY = ""

RECOVER_MODE = False


def check_yt_id_valid(id: str) -> bool:
    """Connects to the YT API and checks if the is valid

    Args:
        id (str): Id of the youtube video

    Returns:
        True if video id still valid, else False
    """
    api_request_url = "https://www.googleapis.com/youtube/v3/videos?part=player&id={0}&key={1}".format(
        id, GOOGLE_DEV_KEY
    )
    try:
        res = requests.get(api_request_url)
        video = res.json()
        video_exists = video["pageInfo"]["totalResults"] == 1
        return video_exists or res.status_code == 403
        # 403 means api usage limit is reached

    except (requests.HTTPError, KeyError):
        # Unexpected request errors
        # Key error if API response is broken
        return True


def get_qid_video_url_dict(check_ids: bool, videofile_location: Optional[str]) -> Dict[str, str]:
    """Loads the file 'youtube_videos.csv' and creates a dict of it

    Args:
        videofile_location: Videofile location. Defaults to "youtube_videos.csv" in the directory of this script.
        check_ids: Check if ids still valid. Defaults to True.

    Returns:
        A dict of qids with their according video url
    """
    try:
        with open(videofile_location, encoding="utf-8") as csv_file:
            videos = {}
            broken_ids = []
            csv_reader = csv.DictReader(csv_file, delimiter=";")
            for row in csv_reader:
                qid = row["q_id"]
                yt_id = row["yt_id"]
                if check_ids and not check_yt_id_valid(yt_id):
                    broken_ids.append(row)
                    continue
                if qid not in videos:
                    videos[qid] = []
                video_url = "https://www.youtube-nocookie.com/embed/{}".format(yt_id)
                videos[qid].append(video_url)

            if broken_ids:
                write_broken_links_to_file(broken_ids)
    except Exception as error:
        logger.error(f"Error when opening following file: {csv_file}. Skipping file now.\nError:")
        logger.exception(error)
        return None

    return videos


def write_broken_links_to_file(
    broken_ids: List[str],
    broken_ids_logging_location: Optional[str] = Path(__file__).resolve().parent.parent / "logs" / "broken_links.json",
) -> None:
    """Writes broken video links to file

    Args:
        broken_ids: List of broken video urls.
        broken_ids_logging_location: Broken ids logging location. Defaults to "logs/broken_links.json".
    """
    broken_ids_out = json.dumps(broken_ids)
    with open(broken_ids_logging_location, "w") as json_file:
        json_file.write(broken_ids_out)


def add_youtube_videos(
    entities: Dict,
    videofile_location: Optional[str] = Path(__file__).resolve().parent / YOUTUBE_VIDEOS_FILE,
    check_ids: bool = True,
) -> Dict:
    """Load the video csv file and add the links to the ontology file

    Args:
        entities: entities which to add youtube videos to (artwork, artist, movement)
        videofile_location: Videofile location. Defaults to "youtube_videos.csv" in the directory of this script.
        check_ids: Check if ids still valid. Defaults to True.
    """
    if GOOGLE_DEV_KEY == "":
        check_ids = False

    videos = get_qid_video_url_dict(check_ids, videofile_location)

    # Set video attribute
    entries_added_count = 0
    for entity in entities:
        if entity[ID] in videos:
            entries_added_count += 1
            entity[VIDEOS] = videos[entity[ID]]

    print("Added videos for {} entries. Saving the file..".format(entries_added_count))

    return entities


if __name__ == "__main__":
    if len(sys.argv) > 1 and "-r" in sys.argv:
        RECOVER_MODE = True
    if RECOVER_MODE and check_state(ETL_STATES.DATA_TRANSFORMATION.ADD_YOUTUBE_VIDEOS):
        exit(0)
    check = "-c" in sys.argv
    for entity_type in [ARTWORK[PLURAL], ARTIST[PLURAL], MOVEMENT[PLURAL]]:
        print(
            datetime.datetime.now(),
            f"Starting with adding youtube videos for file: {entity_type}",
        )
        try:
            # Open file
            with open((create_new_path(entity_type)).with_suffix(f".{JSON}"), encoding="utf-8") as file:
                items = json.load(file)

            entities = add_youtube_videos(items, check_ids=check)

            # Overwrite file
            with open(
                (create_new_path(entity_type)).with_suffix(f".{JSON}"),
                "w",
                newline="",
                encoding="utf-8",
            ) as file:
                json.dump(entities, file, ensure_ascii=False)
        except Exception as error:
            logger.error(f"Error when opening following file: {entity_type}. Skipping file now.\nError:")
            logger.exception(error)
            continue
        print(
            datetime.datetime.now(),
            f"Finished adding youtube videos for file: {entity_type}",
        )
    write_state(ETL_STATES.DATA_TRANSFORMATION.ADD_YOUTUBE_VIDEOS)
