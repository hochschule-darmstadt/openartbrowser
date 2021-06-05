"""Script to estimate start and end of each movement by finding first and last artwork of the movement."""

import json
from pathlib import Path
import ijson
from shared.utils import write_state, check_state, DecimalEncoder
from shared.constants import ETL_STATES
import sys

inceptions = {}
RECOVER_MODE = False

def find_start_end_in_artworks(artworks_file):
    """Finds the first and last inception for each movement in a batch of artworks.
    Fills in inceptions dict.

    Args:
        artworks_file (path-like object): path to file containing the batch to process

    Examples:
        find_start_end_in_artworks(artworks_file)
    """
    artworks_list = ijson.items(open(artworks_file, "r", encoding="utf-8"), "item")
    # find first and last inception for each movement in artworks
    for artwork in artworks_list:
        if artwork["movements"] and artwork["inception"]:
            for art_mov in artwork["movements"]:
                if art_mov in inceptions.keys():
                    if inceptions[art_mov]["start"] > artwork["inception"]:
                        inceptions[art_mov]["start"] = artwork["inception"]
                    if inceptions[art_mov]["end"] < artwork["inception"]:
                        inceptions[art_mov]["end"] = artwork["inception"]
                else:
                    inceptions[art_mov] = {
                        "start": artwork["inception"],
                        "end": artwork["inception"],
                    }
    return


if __name__ == "__main__":
    """Gets for all movements all first and last inceptions from the artworks file and
       sets them to each movement if start_time/end_time is missing.
    """
    if len(sys.argv) > 1 and "-r" in sys.argv:
        RECOVER_MODE = True

    if RECOVER_MODE and check_state(ETL_STATES.DATA_TRANSFORMATION.ESTIMATE_MOVEMENT_PERIOD):
        exit(0)

    # start = datetime.now()
    movements_file = (
            Path(__file__).resolve().parent.parent
            / "crawler_output"
            / "intermediate_files"
            / "json"
            / "movements.json"
    )
    artworks_file = (
            Path(__file__).resolve().parent.parent
            / "crawler_output"
            / "intermediate_files"
            / "json"
            / "artworks.json"
    )
    movements_output_file = movements_file  # Change here for different output file
    movements_list = ijson.items(open(movements_file, "r", encoding="utf-8"), "item")

    find_start_end_in_artworks(artworks_file)

    movements_modified = []
    # for each movement check if start/end needs to be estimated
    for movement in movements_list:
        if movement["id"] in inceptions.keys():
            if (
                    not movement["start_time"]
                    and (
                            not movement["end_time"]
                            or inceptions[movement["id"]]["start"] < movement["end_time"]
                    )
            ) or (
                    movement["start_time"]
                    and inceptions[movement["id"]]["start"] < movement["start_time"]
            ):
                movement["start_time_est"] = inceptions[movement["id"]]["start"]
            else:
                movement["start_time_est"] = ""

            if (
                    not movement["end_time"]
                    and (
                            not movement["start_time"]
                            or inceptions[movement["id"]]["end"] > movement["start_time"]
                    )
            ) or (
                    movement["end_time"]
                    and inceptions[movement["id"]]["end"] > movement["end_time"]
            ):
                movement["end_time_est"] = inceptions[movement["id"]]["end"]
            else:
                movement["end_time_est"] = ""
        else:
            movement["start_time_est"] = ""
            movement["end_time_est"] = ""
        movements_modified.append(movement)

    with open(movements_output_file, "w", newline="", encoding="utf-8") as file:
        json.dump(movements_modified, file, ensure_ascii=False, cls=DecimalEncoder)
    write_state(ETL_STATES.DATA_TRANSFORMATION.ESTIMATE_MOVEMENT_PERIOD)

    # print('took ', datetime.now() - start)
