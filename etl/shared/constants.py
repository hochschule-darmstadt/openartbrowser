"""Shared constants for all python scripts
"""

JSON = "json"
CSV = "csv"
CRAWLER_OUTPUT = "crawler_output"
INTERMEDIATE_FILES = "intermediate_files"
LOGS = "logs"
TYPE = "type"
SINGULAR = "singular"
PLURAL = "plural"
LABEL = {SINGULAR: "label", PLURAL: "labels"}
DESCRIPTION = {SINGULAR: "description", PLURAL: "descriptions"}
GENDER = "gender"
CITIZENSHIP = "citizenship"
ABSTRACT = "abstract"
# TODO: Change to snakecase wikipedia_link (requires changes in the frontend)
WIKIPEDIA_LINK = "wikipediaLink"
COUNTRY = "country"
PLACE_OF_BIRTH = "place_of_birth"
PLACE_OF_DEATH = "place_of_death"
EXHIBITION_HISTORY = "exhibition_history"
ARTWORK = {SINGULAR: "artwork", PLURAL: "artworks"}
MATERIAL = {SINGULAR: "material", PLURAL: "materials"}
MOTIF = {SINGULAR: "motif", PLURAL: "motifs"}
GENRE = {SINGULAR: "genre", PLURAL: "genres"}
MOVEMENT = {SINGULAR: "movement", PLURAL: "movements"}
CLASS = {SINGULAR: "class", PLURAL: "classes"}
ARTIST = {SINGULAR: "artist", PLURAL: "artists"}
LOCATION = {SINGULAR: "location", PLURAL: "locations"}
ABSOLUTE_RANK = "absoluteRank"
RELATIVE_RANK = "relativeRank"
ID = "id"
SIGNIFICANT_EVENT = "significant_event"
PART_OF = "part_of"
HAS_PART = "has_part"
VIDEOS = "videos"
YOUTUBE_VIDEOS_FILE = "youtube_videos.csv"


# ETL states
class ETL_STATES:
    FILENAME = "etl_states.log"

    class GET_WIKIDATA_ITEMS:
        STATE = "get_wikidata_items"
        EXTRACT_SOURCE = "extract_source_"
        MERGED_ARTWORKS = "merged_artworks"

    class GET_WIKIPEDIA_EXTRACTS:
        EXTRACT_ABSTRACTS = "extract_abstracts_"
        STATE = "get_wikipedia_extracts"

    class DATA_TRANSFORMATION:
        ESTIMATE_MOVEMENT_PERIOD = "estimate_movement_period"
        HAS_PART_PART_OF_ENHANCEMENT = "has_part_part_of_enhancement"
        ADD_YOUTUBE_VIDEOS = "add_youtube_videos"
        RANKING = "ranking"
        SPLIT_LANGUAGES = "split_languages"
