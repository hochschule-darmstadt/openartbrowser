"""Ranks the extracted wikidata entities with the oab data enhancement steps.

Implemented as specified in https://github.com/hochschule-darmstadt/openartbrowser/wiki/System-architecture#ranking

Returns:
    The ranked entities which means the attributes absolute rank and relative rank.
"""
import json
import datetime
from numbers import Number
from typing import List, Dict
from shared.constants import *
from shared.utils import create_new_path


def rank_artworks(
    artworks: List[Dict], ignore_keys: List[str] = [ABSOLUTE_RANK, RELATIVE_RANK]
) -> List[Dict]:
    """Ranks a list of artwork entities (JSON-Objects)

    Args:
        artworks: List of artworks
        ignore_keys: Keys within the artwork entities which have to be ignored. Defaults to [ABSOLUTE_RANK, RELATIVE_RANK].

    Returns:
        Ranked artwork list
    """
    for artwork in artworks:
        absolute_rank = 0
        for key, value in artwork.items():
            if key in ignore_keys:
                continue
            if value and type(value) is list:
                absolute_rank += len(value)
            elif value and (type(value) is str or isinstance(value, Number)):
                absolute_rank += 1
            elif value:
                print(f"Unknown type {type(value)} with value {value}")
        artwork.update({ABSOLUTE_RANK: absolute_rank})

    return calc_relative_rank(artworks)


def rank_subjects(
    attribute_name: str, subjects: List[Dict], artworks: List[Dict]
) -> List[Dict]:
    """Ranks subjects like movements

    Args:
        attribute_name: Attribute name in the artwork JSON-objects
        subjects: Subjects like movements, genres etc.
        artworks: List of artwork JSON-objects

    Returns:
        Ranked subject list
    """
    subject_count_dict = {subject[ID]: 0 for subject in subjects}
    for artwork in artworks:
        for attribute_qid in set(artwork[attribute_name]):  # Set to filter duplicates
            if attribute_qid in subject_count_dict:
                subject_count_dict[attribute_qid] += 1
            else:
                print(f"{attribute_qid} not found in subject_count_dict")

    for subject in subjects:
        subject.update({ABSOLUTE_RANK: subject_count_dict[subject[ID]]})

    return calc_relative_rank(subjects)


def calc_relative_rank(entities: List[Dict]) -> List[Dict]:
    sorted_entities = sorted(entities, key=lambda k: k[ABSOLUTE_RANK])
    for i, entity in enumerate(sorted_entities):
        entity.update({RELATIVE_RANK: float(i / len(entities))})

    return sorted_entities


if __name__ == "__main__":
    artworks = []
    for filename in [
        ARTWORK[PLURAL],  # Artworks has to be first otherwise the ranking doesn't work
        MOTIF[PLURAL],  # Main subjects are not considered
        GENRE[PLURAL],
        MATERIAL[PLURAL],
        MOVEMENT[PLURAL],
        ARTIST[PLURAL],
        LOCATION[PLURAL],
    ]:
        print(
            datetime.datetime.now(), "Starting ranking with", filename,
        )
        try:
            # Read in file
            with open(
                (create_new_path(filename)).with_suffix(f".{JSON}"), encoding="utf-8"
            ) as file:
                if filename is ARTWORK[PLURAL]:
                    artworks = out_file = rank_artworks(json.load(file))
                else:
                    out_file = rank_subjects(filename, json.load(file), artworks)
            # Overwrite file
            # TODO if merging is done with sth else as js script than overwrite current file
            with open(
                (create_new_path(filename)).with_suffix(f".{JSON}"),
                "w",
                newline="",
                encoding="utf-8",
            ) as file:
                file.write(json.dumps(out_file, ensure_ascii=False))
            print(
                datetime.datetime.now(), "Finished ranking with", filename,
            )
        except Exception as error:
            print(
                f"Error when opening following file: {filename}. Error: {error}. Skipping file now."
            )
            continue
