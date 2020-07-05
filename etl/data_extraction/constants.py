"""Shared constants within the data_extraction package
"""

from shared.constants import *

AGENT_HEADER = "<nowiki>https://cai-artbrowserstaging.fbi.h-da.de/; tilo.w.michel@stud.h-da.de</nowiki>"

HTTP_HEADER = {
    "Content-Type": "application/json",
    "user_agent": AGENT_HEADER,
}

MAX_LAG = 10  # see https://www.mediawiki.org/wiki/Manual:Maxlag_parameter
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
QUALIFIERS = "qualifiers"
DATATYPE = "datatype"
PROPERTY = "property"
WIKIBASE_ITEM = "wikibase-item"
QUANTITY = "quantity"
STRING = "string"
URL = "url"
MONOLINGUALTEXT = "monolingualtext"
TEXT = "text"
COMMONS_MEDIA = "commonsMedia"
EN = "en"
ENTITIES = "entities"
ABBREVIATION = "abbreviation"
DRAWING = {PLURAL: "drawings", ID: "wd:Q93184"}
SCULPTURE = {PLURAL: "sculptures", ID: "wd:Q860861"}
PAINTING = {PLURAL: "paintings", ID: "wd:Q3305213"}
LATITUDE = {SINGULAR: "latitude", ABBREVIATION: "lat"}
LONGITUDE = {SINGULAR: "longitude", ABBREVIATION: "lon"}

IMAGE = "image"
START_TIME = f"start_{TIME}"
END_TIME = f"end_{TIME}"
INCEPTION = "inception"
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
DATE_OF_BIRTH = "date_of_birth"
DATE_OF_DEATH = "date_of_death"
WEBSITE = "website"
PART_OF = "part_of"
HAS_PART = "has_part"
COORDINATE = "coordinate"
SUBCLASS_OF = "subclass_of"
EXHIBITION = "exhibition"

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
    EXHIBITION_HISTORY: "P608",
    SIGNIFICANT_EVENT: "P793",
    "point_in_time": "P585",
    "of": "P642",
    "owned_by": "P127",
    "price": "P2284",
    "participant": "P710",
    "organizer": "P664",
    "has_cause": "P828",
    "donated_by": "P1028",
    "cause_of_destruction": "P770",
    "destination_point": "P1444",
    "criterion_used": "P1013",
    "statement_is_subject_of": "P805",
    "applies_to_part": "P518",
    "commissioned_by": "P88",
    "operator": "P137",
    "speaker": "P823",
    "determination_method": "P459",
    "date_of_disappearance": "P746",
    "sponsor": "P859",
    "earliest_date": "P1319",
    "latest_date": "P1326",
    "sourcing_circumstances": "P1480",
    "end_cause": "P1534",
    "manager": "P1037",
    "cost": "P2130",
    "uses": "P2283",
    "unveiled_by": "P1656",
    "architect": "P84",
    "dissolved_abolished_or_demolished": "P576",
    "catalog_code": "P528",
    "lot_number": "P4775",
    "inscription": "P1684",
    "described_at_url": "P973",
    "title": "P1476",
    "inventory_number": "P217",
    "depicted_format": "P7984",
    "author_name_string": "P2093",
    "series_ordinal": "P1545",
    "commons_category": "P373",
    "official_name": "P1448",
}

# Inverse dict
PROPERTY_ID_TO_PROPERTY_NAME = {v: k for k, v in PROPERTY_NAME_TO_PROPERTY_ID.items()}
