AGENT_HEADER = "<nowiki>https://cai-artbrowserstaging.fbi.h-da.de/; tilo.w.michel@stud.h-da.de</nowiki>"

HTTP_HEADER = {
    "Content-Type": "application/json",
    "user_agent": AGENT_HEADER,
}

MAX_LAG = 30  # see https://www.mediawiki.org/wiki/Manual:Maxlag_parameter
SLEEP_TIME = 60  # Time in seconds to sleep if a request failed
TIMEOUT = 5  # Time to timeout a request

QID_PATTERN = r"^Q[1-9]\d*"  # Possible QIDs regex starting from Q1

GET_WIKIDATA_ITEMS_LOG_FILENAME = "get_wikidata_items.log"
GET_WIKIPEDIA_EXTRACS_LOG_FILENAME = "get_wikipedia_extracts.log"
WIKIDATA_MAP_ATTRIBUTE_LOG_FILENAME = "map_wd_attribute.log"
WIKIDATA_MAP_RESPONSE_LOG_FILENAME = "map_wd_response.log"
ARTWORK_IDS_QUERY_FILENAME = "artwork_ids_query.sparql"
WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql"
WIKIDATA_ENTITY_URL = "http://www.wikidata.org/entity/"
WIKIDATA_API_URL = "https://www.wikidata.org/w/api.php"
CLAIMS = "claims"
SITELINKS = "sitelinks"
MAINSNAK = "mainsnak"
DATAVALUE = "datavalue"
VALUE = "value"
AMOUNT = "amount"
UNIT = "unit"
TIME = "time"
EN = "en"
ENTITIES = "entities"
ID = "id"
TYPE = "type"
SINGULAR = "singular"
PLURAL = "plural"
ABBREVIATION = "abbreviation"
LABEL = {SINGULAR: "label", PLURAL: "labels"}
DESCRIPTION = {SINGULAR: "description", PLURAL: "descriptions"}
ARTWORK = {SINGULAR: "artwork", PLURAL: "artworks"}
DRAWING = {PLURAL: "drawings", ID: "wd:Q93184"}
SCULPTURE = {PLURAL: "sculptures", ID: "wd:Q860861"}
PAINTING = {PLURAL: "paintings", ID: "wd:Q3305213"}
ABSTRACT = "abstract"
# TODO: Change to snakecase wikipedia_link (requires changes in the frontend)
WIKIPEDIA_LINK = "wikipediaLink"
LATITUDE = {SINGULAR: "latitude", ABBREVIATION: "lat"}
LONGITUDE = {SINGULAR: "longitude", ABBREVIATION: "lon"}

IMAGE = "image"
CLASS = {SINGULAR: "class", PLURAL: "classes"}
ARTIST = {SINGULAR: "artist", PLURAL: "artists"}
LOCATION = {SINGULAR: "location", PLURAL: "locations"}
START_TIME = f"start_{TIME}"
END_TIME = f"end_{TIME}"
GENRE = {SINGULAR: "genre", PLURAL: "genres"}
MOVEMENT = {SINGULAR: "movement", PLURAL: "movements"}
INCEPTION = "inception"
MATERIAL = {SINGULAR: "material", PLURAL: "materials"}
MOTIF = {SINGULAR: "motif", PLURAL: "motifs"}
COUNTRY = "country"
HEIGHT = "height"
HEIGHT_UNIT = f"{HEIGHT}_{UNIT}"
WIDTH = "width"
WIDTH_UNIT = f"{WIDTH}_{UNIT}"
LENGTH = "length"
LENGTH_UNIT = f"{LENGTH}_{UNIT}"
DIAMETER = "diameter"
DIAMETER_UNIT = f"{DIAMETER}_{UNIT}"
UNIT_SYMBOL = f"{UNIT}_symbol"
ICONCLASS = {SINGULAR: "iconclass", PLURAL: "iconclasses"}
MAIN_SUBJECT = {SINGULAR: "main_subject", PLURAL: "main_subjects"}
INFLUENCED_BY = "influenced_by"
GENDER = "gender"
DATE_OF_BIRTH = "date_of_birth"
DATE_OF_DEATH = "date_of_death"
PLACE_OF_BIRTH = "place_of_birth"
PLACE_OF_DEATH = "place_of_death"
CITIZENSHIP = "citizenship"
WEBSITE = "website"
PART_OF = "part_of"
HAS_PART = "has_part"
COORDINATE = "coordinate"
SUBCLASS_OF = "subclass_of"

# All properties extracted from the wikidata entities mapped to their openartbrowser key-label. They don't have a particular order.
PROPERTY_NAME_TO_PROPERTY_ID = {
    IMAGE: "P18",
    CLASS[SINGULAR]: "P31",  # Is called "instance of" in wikidata
    ARTIST[SINGULAR]: "P170",  # Is called "creator" in wikidata
    LOCATION[SINGULAR]: "P276",
    START_TIME: "P580",
    END_TIME: "P582",
    GENRE[SINGULAR]: "P136",
    MOVEMENT[SINGULAR]: "P135",
    INCEPTION: "P571",
    MATERIAL[SINGULAR]: "P186",  # Is called "material used" in wikidata
    MOTIF[SINGULAR]: "P180",  # Is called "depicts" in wikidata
    COUNTRY: "P17",
    HEIGHT: "P2048",
    WIDTH: "P2049",
    LENGTH: "P2043",
    DIAMETER: "P2386",
    UNIT_SYMBOL: "P5061",
    ICONCLASS[SINGULAR]: "P1257",
    MAIN_SUBJECT[SINGULAR]: "P921",
    INFLUENCED_BY: "P737",
    GENDER: "P21",  # Is called "sex or gender" in wikidata
    DATE_OF_BIRTH: "P569",
    DATE_OF_DEATH: "P570",
    PLACE_OF_BIRTH: "P19",
    PLACE_OF_DEATH: "P20",
    CITIZENSHIP: "P27",  # Is called "country of citizenship" in wikidata
    WEBSITE: "P856",  # Is called "official website" in wikidata
    PART_OF: "P361",
    HAS_PART: "P527",
    COORDINATE: "P625",  # Is called "coordinate location" in wikidata
    SUBCLASS_OF: "P279",
}
