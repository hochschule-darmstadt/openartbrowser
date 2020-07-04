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
POINT_IN_TIME = "point_in_time"
OF = "of"
OWNED_BY = "owned_by"
PRICE = "price"
PARTICIPANT = "participant"
ORGANIZER = "organizer"
HAS_CAUSE = "has_cause"
DONATED_BY = "donated_by"
CAUSE_OF_DESTRUCTION = "cause_of_destruction"
DESTINATION_POINT = "destination_point"
CRITERION_USED = "criterion_used"
STATEMENT_IS_SUBJECT_OF = "statement_is_subject_of"
APPLIES_TO_PART = "applies_to_part"
COMMISSIONED_BY = "commissioned_by"
OPERATOR = "operator"
SPEAKER = "speaker"
DETERMINATION_METHOD = "determination_method"
DATE_OF_DISAPPEARANCE = "date_of_disappearance"
SPONSOR = "sponsor"
EARLIEST_DATE = "earliest_date"
LATEST_DATE = "latest_date"
SOURCING_CIRCUMSTANCES = "sourcing_circumstances"
END_CAUSE = "end_cause"
MANAGER = "manager"
COST = "cost"
USES = "uses"
UNVEILED_BY = "unveiled_by"
ARCHITECT = "architect"
DISSOLVED_ABOLISHED_OR_DEMOLISHED = "dissolved_abolished_or_demolished"
CATALOG_CODE = "catalog_code"
LOT_NUMBER = "lot_number"
INSCRIPTION = "inscription"
DESCRIBED_AT_URL = "described_at_url"
TITLE = "title"
INVENTORY_NUMBER = "inventory_number"
DEPICTED_FORMAT = "depicted_format"
AUTHOR_NAME_STRING = "author_name_string"
SERIES_ORDINAL = "series_ordinal"
COMMONS_CATEGORY = "commons_category"
OFFICIAL_NAME = "official_name"

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
    POINT_IN_TIME: "P585",
    OF: "P642",
    OWNED_BY: "P127",
    PRICE: "P2284",
    PARTICIPANT: "P710",
    ORGANIZER: "P664",
    HAS_CAUSE: "P828",
    DONATED_BY: "P1028",
    CAUSE_OF_DESTRUCTION: "P770",
    DESTINATION_POINT: "P1444",
    CRITERION_USED: "P1013",
    STATEMENT_IS_SUBJECT_OF: "P805",
    APPLIES_TO_PART: "P518",
    COMMISSIONED_BY: "P88",
    OPERATOR: "P137",
    SPEAKER: "P823",
    DETERMINATION_METHOD: "P459",
    DATE_OF_DISAPPEARANCE: "P746",
    SPONSOR: "P859",
    EARLIEST_DATE: "P1319",
    LATEST_DATE: "P1326",
    SOURCING_CIRCUMSTANCES: "P1480",
    END_CAUSE: "P1534",
    MANAGER: "P1037",
    COST: "P2130",
    USES: "P2283",
    UNVEILED_BY: "P1656",
    ARCHITECT: "P84",
    DISSOLVED_ABOLISHED_OR_DEMOLISHED: "P576",
    CATALOG_CODE: "P528",
    LOT_NUMBER: "P4775",
    INSCRIPTION: "P1684",
    DESCRIBED_AT_URL: "P973",
    TITLE: "P1476",
    INVENTORY_NUMBER: "P217",
    DEPICTED_FORMAT: "P7984",
    AUTHOR_NAME_STRING: "P2093",
    SERIES_ORDINAL: "P1545",
    COMMONS_CATEGORY: "P373",
    OFFICIAL_NAME: "P1448",
}

# Inverse dict
PROPERTY_ID_TO_PROPERTY_NAME = {v: k for k, v in PROPERTY_NAME_TO_PROPERTY_ID.items()}
