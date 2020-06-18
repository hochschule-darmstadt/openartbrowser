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
import json
import sys
from pathlib import Path
from typing import Optional
import requests

ADD_FOR_TYPES = ["artwork", "artist", "movement"]
try:
    GOOGLE_DEV_KEY = open("google_dev_key.txt").read()
except FileNotFoundError:
    GOOGLE_DEV_KEY = ""


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


def add_youtube_videos(
    videofile_location: Optional[str] = Path(__file__).resolve().parent
    / "youtube_videos.csv",
    ontology_location: Optional[str] = Path(__file__).resolve().parent.parent
    / "crawler_output/art_ontology.json",
    ontology_output_location: Optional[str] = Path(__file__).resolve().parent.parent
    / "crawler_output/art_ontology.json",
    broken_ids_logging_location: Optional[str] = Path(__file__).resolve().parent.parent
    / "logs/broken_links.json",
    check_ids: bool = True,
) -> None:
    """Load the video csv file and add the links to the ontology file

    Args:
        videofile_location: Videofile location. Defaults to "youtube_videos.csv" in the directory of this script.
        ontology_location: Input art_ontology.json location. Defaults to "crawler_output/art_ontology.json".
        ontology_output_location: Output art_ontology.json location. Defaults to "crawler_output/art_ontology.json".
        broken_ids_logging_location: Broken ids logging location. Defaults to "logs/broken_links.json".
        check_ids: Check if ids still valid. Defaults to True.
    """
    if GOOGLE_DEV_KEY == "":
        check_ids = False

    videos = {}
    broken_ids = []

    with open(videofile_location, encoding="utf-8") as csv_file:
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

    if len(broken_ids) > 0:
        broken_ids_out = json.dumps(broken_ids)
        with open(broken_ids_logging_location, "w") as json_file:
            json_file.write(broken_ids_out)

    with open(ontology_location, encoding="utf-8") as json_file:
        ontology = json.load(json_file)

    entries_added_count = 0
    for entry in ontology:
        if entry["id"] in videos and entry["type"] in ADD_FOR_TYPES:
            entries_added_count += 1
            entry["videos"] = videos[entry["id"]]

    print("Added videos for {} entries. Saving the file..".format(entries_added_count))

    ontology_out = json.dumps(ontology)
    open(ontology_output_location, "w").write(ontology_out)


if __name__ == "__main__":
    check = "-c" in sys.argv
    add_youtube_videos(check_ids=check)
