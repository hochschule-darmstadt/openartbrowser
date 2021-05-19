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
# The wd: prefix is used here because these ids are used in a SPARQL query
SOURCE_TYPES = [
    # {SINGULAR: 'artwork', PLURAL: 'artworks', ID: 'wd:Q838948'},
    {SINGULAR: 'painting', PLURAL: 'paintings', ID: 'wd:Q3305213'},
    {SINGULAR: 'oil_sketch', PLURAL: 'oil_sketches', ID: 'wd:Q1964917'},
    {SINGULAR: 'watercolor_painting', PLURAL: 'watercolor_paintings', ID: 'wd:Q18761202'},
    {SINGULAR: 'gouache_painting', PLURAL: 'gouache_paintings', ID: 'wd:Q21281546'},
    {SINGULAR: 'illumination', PLURAL: 'illuminations', ID: 'wd:Q8362'},
    {SINGULAR: 'fresco', PLURAL: 'frescoes', ID: 'wd:Q22669139'},
    {SINGULAR: 'cycle_of frescoes', PLURAL: 'cycles_of frescoes', ID: 'wd:Q16905550'},
    {SINGULAR: 'mural', PLURAL: 'murals', ID: 'wd:Q219423'},
    {SINGULAR: 'graffiti', PLURAL: 'graffiti', ID: 'wd:Q17514'},
    {SINGULAR: 'drawing', PLURAL: 'drawings', ID: 'wd:Q93184'},
    {SINGULAR: 'print', PLURAL: 'prints', ID: 'wd:Q11060274'},
    {SINGULAR: 'intaglio_printing', PLURAL: 'intaglio_printings', ID: 'wd:Q194177'},
    {SINGULAR: 'engraving', PLURAL: 'engravings', ID: 'wd:Q11835431'},
    {SINGULAR: 'copper_engraving print', PLURAL: 'copper_engraving prints', ID: 'wd:Q18887969'},
    {SINGULAR: 'mezzotint_print', PLURAL: 'mezzotint_prints', ID: 'wd:Q21647744'},
    {SINGULAR: 'stipple_engraving', PLURAL: 'stipple_engravings', ID: 'wd:Q22669539'},
    {SINGULAR: 'steel_engraving print', PLURAL: 'steel_engraving prints', ID: 'wd:Q22669546'},
    {SINGULAR: 'etching_print', PLURAL: 'etching_prints', ID: 'wd:Q18218093'},
    {SINGULAR: 'soft-ground etching', PLURAL: 'soft-ground etchings', ID: 'wd:Q22669562'},
    {SINGULAR: 'aquatint_print', PLURAL: 'aquatint_prints', ID: 'wd:Q18396864'},
    {SINGULAR: 'drypoint_print', PLURAL: 'drypoint_prints', ID: 'wd:Q23657281'},
    {SINGULAR: 'monoprinting', PLURAL: 'monoprintings', ID: 'wd:Q6901903'},
    {SINGULAR: 'planographic_printing', PLURAL: 'planographic_printings', ID: 'wd:Q3735299'},
    {SINGULAR: 'lithograph', PLURAL: 'lithographs', ID: 'wd:Q15123870'},
    {SINGULAR: 'zincograph', PLURAL: 'zincographs', ID: 'wd:Q21648161'},
    {SINGULAR: 'monotype_print', PLURAL: 'monotype_prints', ID: 'wd:Q22669635'},
    {SINGULAR: 'offset_print', PLURAL: 'offset_prints', ID: 'wd:Q22004031'},
    {SINGULAR: 'relief_printing', PLURAL: 'relief_printings', ID: 'wd:Q3921059'},
    {SINGULAR: 'linocut_print', PLURAL: 'linocut_prints', ID: 'wd:Q22060043'},
    {SINGULAR: 'woodcut_print', PLURAL: 'woodcut_prints', ID: 'wd:Q18219090'},
    {SINGULAR: 'xylography', PLURAL: 'xylographies', ID: 'wd:Q16295560'},
    {SINGULAR: 'xylographer', PLURAL: 'xylographers', ID: 'wd:Q1437754'},
    {SINGULAR: 'chiaroscuro_woodcut', PLURAL: 'chiaroscuro_woodcuts', ID: 'wd:Q21648003'},
    {SINGULAR: 'wood_engraving print', PLURAL: 'wood_engraving prints', ID: 'wd:Q22669664'},
    {SINGULAR: 'Screen_print', PLURAL: 'Screen_prints', ID: 'wd:Q22569957'},
    {SINGULAR: 'photogravure_technique', PLURAL: 'photogravure_techniques', ID: 'wd:Q1602553'},
    {SINGULAR: 'rotogravure', PLURAL: 'rotogravures', ID: 'wd:Q635658'},
    {SINGULAR: 'heliogravure_print', PLURAL: 'heliogravure_prints', ID: 'wd:Q23641696'},
    {SINGULAR: 'photolithography', PLURAL: 'photolithographies', ID: 'wd:Q622938'},
    {SINGULAR: 'collotype_technique', PLURAL: 'collotype_techniques', ID: 'wd:Q1572315'},
    {SINGULAR: 'laser_print', PLURAL: 'laser_prints', ID: 'wd:Q21550731'},
    {SINGULAR: 'blueprint', PLURAL: 'blueprints', ID: 'wd:Q422321'},
    {SINGULAR: 'photograph', PLURAL: 'photographs', ID: 'wd:Q125191'},
    {SINGULAR: 'platinum_print', PLURAL: 'platinum_prints', ID: 'wd:Q2098669'},
    {SINGULAR: 'pastel', PLURAL: 'pastels', ID: 'wd:Q12043905'},
    {SINGULAR: 'calligraphic_work', PLURAL: 'calligraphic_works', ID: 'wd:Q22669850'},
    {SINGULAR: 'collage', PLURAL: 'collages', ID: 'wd:Q22669857'},
    {SINGULAR: 'mosaic', PLURAL: 'mosaics', ID: 'wd:Q133067'},
    {SINGULAR: 'pietra_dura', PLURAL: 'pietra_duras', ID: 'wd:Q61818913'},
    {SINGULAR: 'stained_glass', PLURAL: 'stained_glasses', ID: 'wd:Q1473346'},
    {SINGULAR: 'tapestry', PLURAL: 'tapestries', ID: 'wd:Q184296'},
    {SINGULAR: 'carpet', PLURAL: 'carpets', ID: 'wd:Q163446'},
    {SINGULAR: 'poster', PLURAL: 'posters', ID: 'wd:Q429785'},
    {SINGULAR: 'embroidery', PLURAL: 'embroideries', ID: 'wd:Q28966302'},
    {SINGULAR: 'sculpture', PLURAL: 'sculptures', ID: 'wd:Q860861'},
    {SINGULAR: 'relief_sculpture', PLURAL: 'relief_sculptures', ID: 'wd:Q23662753'},
    {SINGULAR: 'medal', PLURAL: 'medals', ID: 'wd:Q131647'},
    {SINGULAR: 'commemorative_plaque', PLURAL: 'commemorative_plaques', ID: 'wd:Q721747'},
    {SINGULAR: 'installation', PLURAL: 'installations', ID: 'wd:Q20437094'},
    {SINGULAR: 'video_installation', PLURAL: 'video_installations', ID: 'wd:Q550484'},
    {SINGULAR: 'sound_installation', PLURAL: 'sound_installations', ID: 'wd:Q2633362'},
    {SINGULAR: 'light_installation', PLURAL: 'light_installations', ID: 'wd:Q1823448'},
    {SINGULAR: 'kinetic_object', PLURAL: 'kinetic_objects', ID: 'wd:Q29857932'},
    {SINGULAR: 'found_object', PLURAL: 'found_objects', ID: 'wd:Q572916'},
    {SINGULAR: 'assemblage', PLURAL: 'assemblages', ID: 'wd:Q262343'},
    {SINGULAR: 'light_sculpture', PLURAL: 'light_sculptures', ID: 'wd:Q29885984'},
    {SINGULAR: 'textile_design', PLURAL: 'textile_designs', ID: 'wd:Q763631'},
    {SINGULAR: 'textile_artwork', PLURAL: 'textile_artworks', ID: 'wd:Q22075301'},
    {SINGULAR: 'ceramics', PLURAL: 'ceramic', ID: 'wd:Q13464614'},
    {SINGULAR: 'glass_art', PLURAL: 'glass_arts', ID: 'wd:Q5567091'},
    {SINGULAR: 'jewelry', PLURAL: 'jewelries', ID: 'wd:Q161439'},
    {SINGULAR: 'environmental_artwork', PLURAL: 'environmental_artworks', ID: 'wd:Q21042249'},
    {SINGULAR: 'mask', PLURAL: 'masks', ID: 'wd:Q161524'},
    {SINGULAR: 'performance_artwork', PLURAL: 'performance_artworks', ID: 'wd:Q22672348'},
    {SINGULAR: 'happening', PLURAL: 'happenings', ID: 'wd:Q108874'},
    {SINGULAR: 'video_artwork', PLURAL: 'video_artworks', ID: 'wd:Q20742776'},
    {SINGULAR: 'video_sculpture', PLURAL: 'video_sculptures', ID: 'wd:Q7927987'},
    {SINGULAR: 'ensemble_of works of art', PLURAL: 'ensembles_of works of art', ID: 'wd:Q28870066'},
    {SINGULAR: 'sculptural_group', PLURAL: 'sculptural_groups', ID: 'wd:Q2334148'},
    {SINGULAR: 'polyptych', PLURAL: 'polyptyches', ID: 'wd:Q1278452'},
    {SINGULAR: 'diptych', PLURAL: 'diptyches', ID: 'wd:Q475476'},
    {SINGULAR: 'triptych', PLURAL: 'triptyches', ID: 'wd:Q79218'},
    {SINGULAR: 'quadriptych', PLURAL: 'quadriptyches', ID: 'wd:Q21915367'},
    {SINGULAR: 'pentaptych', PLURAL: 'pentaptyches', ID: 'wd:Q21915380'},
    {SINGULAR: 'hexaptych', PLURAL: 'hexaptyches', ID: 'wd:Q21915411'},
    {SINGULAR: 'heptaptych', PLURAL: 'heptaptyches', ID: 'wd:Q21915564'},
    {SINGULAR: 'octaptych', PLURAL: 'octaptyches', ID: 'wd:Q21915574'},
    {SINGULAR: 'mixed_media', PLURAL: 'mixed_medias', ID: 'wd:Q1902763'},
    {SINGULAR: 'illuminated_manuscript', PLURAL: 'illuminated_manuscripts', ID: 'wd:Q48498'}
]
LATITUDE = {SINGULAR: "latitude", ABBREVIATION: "lat"}
LONGITUDE = {SINGULAR: "longitude", ABBREVIATION: "lon"}
ART_MOVEMENT = {SINGULAR: "art_movement", ID: "Q968159"}
ART_STYLE = {SINGULAR: "art_style", ID: "Q1792644"}

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
