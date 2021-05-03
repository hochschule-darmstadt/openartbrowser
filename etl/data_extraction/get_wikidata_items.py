"""Get relevant wikidata entities

Examples:
    Get all artwork entities from the three crawled artwork classes: drawings, paintings, sculptures
    python3 get_wikidata_items.py

    Get one chunk per artwork subclass
    python3 get_wikidata_items.py -d

    Get two chunks per artwork subclass
    python3 get_wikidata_items.py -d 2

Returns:
    Different *.json and *.csv files for the extracted wikidata entities which are mapped to the openArtBrowser entities/models
    - artworks.json/.csv
        - paintings.json/.csv
        - drawings.json/.csv
        - sculptures.json/.csv
    - artists.json/.csv
    - classes.json/.csv
    - genres.json/.csv
    - locations.json/.csv
    - materials.json/.csv
    - motifs.json/.csv
    - movements.json/.csv
"""
import csv
import datetime
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional

from data_extraction import load_wd_entities
from data_extraction.constants import *
from shared.constants import *
from shared.utils import (
    create_new_path,
    generate_json,
    language_config_to_list,
    setup_logger,
)

DEV = False
DEV_CHUNK_LIMIT = 2  # Not entry but chunks of 50

logger = setup_logger(
    "data_extraction.get_wikidata_items",
    Path(__file__).parent.parent.absolute() / "logs" / GET_WIKIDATA_ITEMS_LOG_FILENAME,
)

lang_keys = [item[0] for item in language_config_to_list()]


def write_data_to_json_and_csv(
        motifs: List[Dict],
        genres: List[Dict],
        extracted_classes: List[Dict],
        materials: List[Dict],
        movements: List[Dict],
        locations: List[Dict],
        merged_artworks: List[Dict],
        artists: List[Dict],
) -> None:
    """Writes the given lists of dictionaries to json and csv files

    Args:
        motifs: List of motifs
        genres: List of genres
        extracted_classes: List of classes
        materials: List of materials
        movements: List of movements
        locations: List of locations
        merged_artworks: List of artworks
        artists: List of artists
    """
    generate_json(motifs, create_new_path(MOTIF[PLURAL]))
    generate_csv(
        motifs,
        get_fields(MOTIF[PLURAL]),
        create_new_path(MOTIF[PLURAL], file_type=CSV),
    )
    generate_json(genres, create_new_path(GENRE[PLURAL]))
    generate_csv(
        genres,
        get_fields(GENRE[PLURAL]),
        create_new_path(GENRE[PLURAL], file_type=CSV),
    )
    generate_json(extracted_classes, create_new_path(CLASS[PLURAL]))
    generate_csv(
        extracted_classes,
        get_fields(CLASS[PLURAL]),
        create_new_path(CLASS[PLURAL], file_type=CSV),
    )
    generate_json(materials, create_new_path(MATERIAL[PLURAL]))
    generate_csv(
        materials,
        get_fields(MATERIAL[PLURAL]),
        create_new_path(MATERIAL[PLURAL], file_type=CSV),
    )
    generate_json(movements, create_new_path(MOVEMENT[PLURAL]))
    generate_csv(
        movements,
        get_fields(MOVEMENT[PLURAL]),
        create_new_path(MOVEMENT[PLURAL], file_type=CSV),
    )
    generate_json(locations, create_new_path(LOCATION[PLURAL]))
    generate_csv(
        locations,
        get_fields(LOCATION[PLURAL]),
        create_new_path(LOCATION[PLURAL], file_type=CSV),
    )
    generate_json(merged_artworks, create_new_path(ARTWORK[PLURAL]))
    generate_csv(
        merged_artworks,
        get_fields(ARTWORK[PLURAL]),
        create_new_path(ARTWORK[SINGULAR], file_type=CSV),
    )
    generate_json(artists, create_new_path(ARTIST[PLURAL]))
    generate_csv(
        artists,
        get_fields(ARTIST[PLURAL]),
        create_new_path(ARTIST[PLURAL], file_type=CSV),
    )


# region csv file functions
def get_fields(
        type_name: str, language_keys: Optional[List[str]] = lang_keys,
) -> List[str]:
    """Returns all columns for a specific type, e. g. 'artworks'

    Args:
        type_name: Type to get the column names for
        language_keys: All language keys which should be extracted. Defaults to languageconfig.csv

    Returns:
        A list of column names for the given type name
    """
    fields = [ID, CLASS[PLURAL], LABEL[SINGULAR], DESCRIPTION[SINGULAR], IMAGE, TYPE]
    for langkey in language_keys:
        fields += [
            f"{LABEL[SINGULAR]}_{langkey}",
            f"{DESCRIPTION[SINGULAR]}_{langkey}",
            f"{WIKIPEDIA_LINK}_{langkey}",
        ]
    if type_name in [source_type[PLURAL] for source_type in SOURCE_TYPES] + [ARTWORK[PLURAL]]:
        fields += [
            ARTIST[PLURAL],
            LOCATION[PLURAL],
            GENRE[PLURAL],
            MOVEMENT[PLURAL],
            INCEPTION,
            MATERIAL[PLURAL],
            MOTIF[PLURAL],
            COUNTRY,
            HEIGHT,
            HEIGHT_UNIT,
            WIDTH,
            WIDTH_UNIT,
            DIAMETER,
            DIAMETER_UNIT,
            LENGTH,
            LENGTH_UNIT,
            ICONCLASS[PLURAL],
            MAIN_SUBJECT[PLURAL],
            EXHIBITION_HISTORY,
            SIGNIFICANT_EVENT,
        ]
        for langkey in language_keys:
            fields += [f"{COUNTRY}_{langkey}"]
    elif type_name == ARTIST[PLURAL]:
        for langkey in language_keys:
            fields += [f"{PLACE_OF_BIRTH}_{langkey}", f"{PLACE_OF_DEATH}_{langkey}"]
        fields += [
            GENDER,
            DATE_OF_BIRTH,
            DATE_OF_DEATH,
            PLACE_OF_BIRTH,
            PLACE_OF_DEATH,
            CITIZENSHIP,
            MOVEMENT[PLURAL],
            INFLUENCED_BY,
        ]
        for langkey in language_keys:
            fields += [f"{GENDER}_{langkey}", f"{CITIZENSHIP}_{langkey}"]
    elif type_name == MOVEMENT[PLURAL]:
        for langkey in language_keys:
            fields += [f"{COUNTRY}_{langkey}"]
        fields += [INFLUENCED_BY, PART_OF, END_TIME, COUNTRY, HAS_PART, START_TIME]
    elif type_name == LOCATION[PLURAL]:
        fields += [
            COUNTRY,
            WEBSITE,
            PART_OF,
            LATITUDE[ABBREVIATION],
            LONGITUDE[ABBREVIATION],
        ]
        for langkey in language_keys:
            fields += [f"{COUNTRY}_{langkey}"]
    elif type_name == CLASS[PLURAL]:
        fields = [ID, LABEL[SINGULAR], DESCRIPTION[SINGULAR], SUBCLASS_OF, TYPE]
        for langkey in language_keys:
            fields += [
                f"{LABEL[SINGULAR]}_{langkey}",
                f"{DESCRIPTION[SINGULAR]}_{langkey}",
            ]
    return fields


def generate_csv(extract_dicts: List[Dict], fields: List[str], filename: str) -> None:
    """Generates a csv file from a dictionary

    Args:
        extract_dicts: List of dicts that containing wikidata entities transformed to oab entities
        fields: Column names for the given dicts
        filename: Name of the file to write the data to
    """
    filename.parent.mkdir(parents=True, exist_ok=True)
    with open(
            filename.with_suffix(f".{CSV}"), "w", newline="", encoding="utf-8"
    ) as file:
        writer = csv.DictWriter(file, fieldnames=fields, delimiter=";", quotechar='"')
        writer.writeheader()
        for extract_dict in extract_dicts:
            writer.writerow(extract_dict)


# endregion


def merge_artworks() -> List[Dict]:
    """Merges artworks from files 'paintings.json', 'drawings.json',
    'sculptures.json' (function extract_artworks) and
    stores them in a dictionary

    Returns:
        A list of dictionaries containing all artworks
    """
    print(datetime.datetime.now(), "Starting with", "merging artworks")
    artworks = set()
    file_names = [f"{source_type[PLURAL]}.{JSON}" for source_type in SOURCE_TYPES]
    file_names = [
        create_new_path(ARTWORK[PLURAL], subpath=file_name) for file_name in file_names
    ]
    extract_dicts = []

    for file_name in file_names:
        with open(file_name, encoding="utf-8") as input:
            object_array = json.load(input)
            for object in object_array:
                if not object[ID] in artworks:  # remove duplicates
                    object[TYPE] = ARTWORK[SINGULAR]
                    extract_dicts.append(object)
                    artworks.add(object[ID])

    print(datetime.datetime.now(), "Finished with", "merging artworks")
    print()
    return extract_dicts


def extract_art_ontology() -> None:
    """Extracts *.csv and *.json files for artworks and subjects (e. g. motifs, movements) from wikidata
    """

    # Array of already crawled wikidata items
    already_crawled_wikidata_items = set()

    for source in SOURCE_TYPES:
        extracted_artwork = load_wd_entities.extract_artworks(
            source[PLURAL], source[ID], already_crawled_wikidata_items, DEV, DEV_CHUNK_LIMIT
        )

        path_name = create_new_path(ARTWORK[PLURAL], source[PLURAL], CSV)
        generate_csv(extracted_artwork, get_fields(source[PLURAL]), path_name)

        path_name = create_new_path(ARTWORK[PLURAL], source[PLURAL], JSON)
        generate_json(extracted_artwork, path_name)

    merged_artworks = merge_artworks()

    path_name = create_new_path(ARTWORK[PLURAL], file_type=CSV)

    # Get motifs and main subjects
    motifs = load_wd_entities.extract_motifs_and_main_subjects(merged_artworks)
    [motif.update({TYPE: MOTIF[SINGULAR]}) for motif in motifs]
    # Get extracted genres, materials, etc.
    (
        genres,
        materials,
        movements,
        artists,
        locations,
    ) = load_wd_entities.bundle_extract_subjects_calls(
        [
            GENRE[PLURAL],
            MATERIAL[PLURAL],
            MOVEMENT[PLURAL],
            ARTIST[PLURAL],
            LOCATION[PLURAL],
        ],
        merged_artworks,
    )
    print("Total movements after transitive closure loading: ", len(movements))

    for subject, type_name in [
        (genres, GENRE[SINGULAR]),
        (materials, MATERIAL[SINGULAR]),
        (movements, MOVEMENT[SINGULAR]),
        (artists, ARTIST[SINGULAR]),
        (locations, LOCATION[SINGULAR]),
    ]:
        [entity.update({TYPE: type_name}) for entity in subject]

    # Get distinct classes from artworks, motifs, etc.
    extracted_classes = load_wd_entities.get_distinct_extracted_classes(
        merged_artworks, motifs, genres, materials, movements, artists, locations,
    )
    [c.update({TYPE: CLASS[SINGULAR]}) for c in extracted_classes]
    print("Total classes after transitive closure loading: ", len(extracted_classes))
    # Get country labels for merged artworks and locations
    (
        locations,
        merged_artworks,
        movements,
    ) = load_wd_entities.get_country_labels_for_merged_artworks_and_locations(
        locations, merged_artworks, movements
    )

    # Get labels for artists
    artists = load_wd_entities.get_labels_for_artists(
        artists, [GENDER, PLACE_OF_BIRTH, PLACE_OF_DEATH, CITIZENSHIP]
    )

    # Get unit symbols from qid for artworks
    distinct_unit_qids = load_wd_entities.get_distinct_unit_symbol_qids(merged_artworks)
    unit_symbols = load_wd_entities.get_unit_symbols(distinct_unit_qids)
    load_wd_entities.resolve_unit_id_to_unit_symbol(merged_artworks, unit_symbols)

    # Get exhibition histories as subdict
    merged_artworks = load_wd_entities.resolve_exhibition_ids_to_exhibition_entities(
        merged_artworks
    )

    # Significant events as subdict
    merged_artworks = load_wd_entities.resolve_significant_event_id_entities_to_labels(
        merged_artworks
    )

    # Write to JSON
    write_data_to_json_and_csv(
        motifs,
        genres,
        extracted_classes,
        materials,
        movements,
        locations,
        merged_artworks,
        artists,
    )


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "-d":
        if len(sys.argv) > 2 and sys.argv[2].isdigit():
            DEV_CHUNK_LIMIT = int(sys.argv[2])
        print("DEV MODE: on, DEV_LIM={0}".format(DEV_CHUNK_LIMIT))
        DEV = True

    logger.info("Extracting Art Ontology")
    extract_art_ontology()
