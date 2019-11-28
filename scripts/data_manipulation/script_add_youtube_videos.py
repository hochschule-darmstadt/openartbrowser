import csv
import json

add_for_types = ["artwork", "artist", "movement"]


def add_youtube_videos(
        videofile_location="youtube_videos.csv",
        ontology_location="../crawler_output/art_ontology.json",
        ontology__output_location="../crawler_output/art_ontology.json",
) -> None:
    """Load the video csv file and add the links to the ontology file"""
    videos = {}

    with open(videofile_location, encoding="utf-8") as csv_file:
        csv_reader = csv.DictReader(csv_file, delimiter=';')
        for row in csv_reader:
            qid = row["q_id"]
            if qid not in videos:
                videos[qid] = []
            video_url = "https://www.youtube.com/embed/{}".format(row["yt_id"])
            videos[qid].append(video_url)

    with open(ontology_location, encoding="utf-8") as json_file:
        ontology = json.load(json_file)

    entries_added_count = 0
    for entry in ontology:
        if entry["id"] in videos and entry['type'] in add_for_types:
            entries_added_count += 1
            entry["videos"] = videos[entry["id"]]

    print("Added videos for {} entries. Saving the file..".format(entries_added_count))

    ontology_out = json.dumps(ontology)
    open(ontology__output_location, 'w').write(ontology_out)


if __name__ == "__main__":
    add_youtube_videos()
