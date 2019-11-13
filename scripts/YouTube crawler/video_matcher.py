import json

from fuzzywuzzy import fuzz, process


class VideoMatcher(object):
    """This class gets finds matches of Youtube videos and OpenArt objects."""

    def __init__(self, to_match):
        """Initialize with the filename of the videos that shall be matched"""

        # Load the videos from the json file.
        filename_videos = "output/{}.json".format(to_match)
        with open(filename_videos, 'r') as f1:
            self.videos = json.load(f1)

    def match(self, category):
        """Iterate through all DB entries and find matches."""
        if category == "artists":
            with open("input_data/artists.json", "r", encoding="utf8") as artits_file:
                artists = json.load(artits_file)
                entities = {artist["id"]: artist["label"] for artist in artists}

        elif category == "movements":
            with open("input_data/movements.json", "r", encoding="utf8") as movements_file:
                movements = json.load(movements_file)
                entities = {movement["id"]: movement["label"] for movement in movements}

        elif category == "artworks":
            with open("input_data/artworks.json", "r", encoding="utf8") as artworks_file:
                artworks = json.load(artworks_file)
                entities = {artwork["id"]: artwork["label"] + artwork["description"] for artwork in
                            artworks}

        video_descriptions = {video["id"]: video["title"] + video["description"] for video in
                              self.videos}

        matches = {}
        for entity_id in entities:
            entity = entities[entity_id]
            if entity == '':
                continue
            try:
                match = process.extractOne(
                    entity,
                    video_descriptions,
                    scorer=fuzz.partial_token_sort_ratio,
                )
            except:
                continue
            print("Matching {}, highest match {}%".format(entity, match[1]))
            matches[entity_id + " - " + entity] = match

        return matches
