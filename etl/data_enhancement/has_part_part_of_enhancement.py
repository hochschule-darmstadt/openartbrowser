"""Enhance the attributes has_part, part_of of movements
by adding the corresponding movement ids to these attributes
since they are inverse to each other
"""
from typing import List, Dict
from pathlib import Path
from shared.constants import ID, HAS_PART, PART_OF
import json


def inverse_attribute_enhancement(
    attribute: str, inverse_attribute: str, movements: List[Dict]
) -> List[Dict]:
    """Enhance all attributes which have a inverse attribute by adding the corresponding ids to
    the inverse attribute in the movement JSON objects

    Args:
        movements: A list of all movement objects

    Returns:
        A list of movements with the has_part attribute enriched by the part_of attribute
    """
    qid_index_dict = {movement[ID]: i for i, movement in enumerate(movements)}
    for movement in movements:
        if movement[attribute]:
            # Remove qids from the attribute which are not known in the movements file because
            # they're not loaded (architectural styles etc.) + filter duplicates here with a set comprehension
            movement[attribute] = list(
                {
                    qid
                    for qid in movement[attribute]
                    if qid in list(qid_index_dict.keys())
                }
            )
            for qid in movement[attribute]:
                # Add the current movement id to the inverse attribute list
                if (
                    movement[ID]
                    not in movements[qid_index_dict[qid]][inverse_attribute]
                ):
                    movements[qid_index_dict[qid]][inverse_attribute].append(
                        movement[ID]
                    )

    return movements


if __name__ == "__main__":
    movements_file = (
        Path(__file__).resolve().parent.parent
        / "crawler_output"
        / "intermediate_files"
        / "json"
        / "movements.json"
    )

    with open(movements_file, encoding="utf-8") as file:
        movements = json.load(file)
        movements = inverse_attribute_enhancement(HAS_PART, PART_OF, movements)
        movements = inverse_attribute_enhancement(PART_OF, HAS_PART, movements)

    with open(movements_file, "w", newline="", encoding="utf-8") as file:
        file.write(json.dumps(movements, ensure_ascii=False))
