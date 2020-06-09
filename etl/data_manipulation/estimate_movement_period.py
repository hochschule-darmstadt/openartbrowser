import json
from pathlib import Path
import ijson

inceptions = {}


def find_start_end_in_artworks(artworks_file):
    artworks_list = ijson.items(open(artworks_file, "r", encoding="utf-8"), "item")
    # find first and last inception for each movement in artworks
    for artwork in artworks_list:
        if artwork['movements'] and artwork['inception']:
            for art_mov in artwork['movements']:
                if art_mov in inceptions.keys():
                    if inceptions[art_mov]['start'] > artwork['inception']:
                        inceptions[art_mov]['start'] = artwork['inception']
                    if inceptions[art_mov]['end'] < artwork['inception']:
                        inceptions[art_mov]['end'] = artwork['inception']
                else:
                    inceptions[art_mov] = {'start': artwork['inception'], 'end': artwork['inception']}
    return


if __name__ == "__main__":
    # start = datetime.now()
    movements_file = (Path(
        __file__).resolve().parent.parent / "crawler_output" / "intermediate_files" / "json" / "movements.json")
    artworks_file = (Path(
        __file__).resolve().parent.parent / "crawler_output" / "intermediate_files" / "json" / "artworks.json")
    movements_output_file = movements_file  # Change here for different output file
    movements_list = ijson.items(open(movements_file, "r", encoding="utf-8"), 'item')

    find_start_end_in_artworks(artworks_file)

    movements_modified = []
    # for each movement check if start/end needs to be estimated
    for movement in movements_list:
        if movement['id'] in inceptions.keys():
            if (not movement['start_time'] and (
                    not movement['end_time'] or inceptions[movement['id']]['start'] < movement['end_time'])) or (
                    movement['start_time'] and inceptions[movement['id']]['start'] < movement['start_time']):
                movement['start_time_est'] = inceptions[movement['id']]['start']
            else:
                movement['start_time_est'] = ''

            if (not movement['end_time'] and (
                    not movement['start_time'] or inceptions[movement['id']]['end'] > movement['start_time'])) or (
                    movement['end_time'] and inceptions[movement['id']]['end'] > movement['end_time']):
                movement['end_time_est'] = inceptions[movement['id']]['end']
            else:
                movement['end_time_est'] = ''
        else:
            movement['start_time_est'] = ''
            movement['end_time_est'] = ''
        movements_modified.append(movement)

    with open(movements_output_file, "w", newline="", encoding="utf-8") as file:
        file.write(json.dumps(movements_modified, ensure_ascii=False))

    # print('took ', datetime.now() - start)
