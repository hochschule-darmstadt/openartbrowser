"""Generate an rdf file from the art_ontology_en.json file

Example:
    python3 generate_rdf.py

Raises:
    Exception: If an unexpected type is in the art_ontology_en.json an error is thrown
"""
import datetime
import json
import urllib
from pathlib import Path

from loguru import logger


def uri_validator(uri: str) -> bool:
    """Validates if a string is an URI

    Args:
        uri: String of an possible URI

    Returns:
        True if the string is an URI, else False
    """
    try:
        result = urllib.parse.urlparse(uri)
        return all([result.scheme, result.netloc, result.path])
    except Exception as e:
        logger.error(e)
        return False


def generate_rdf(
    file: str = Path(__file__).parent.parent.absolute()
    / "crawler_output"
    / "art_ontology_en.json",
    header: str = Path(__file__).parent.absolute() / "art_ontology_header.txt",
    ontology: str = Path(__file__).parent.parent.absolute()
    / "crawler_output"
    / "art_ontology_en.ttl",
) -> None:
    """Generates an RDF Turtle file 'art_ontology_en.ttl' from *.json files

    Args:
        file: Input file to generate the rdf from. Defaults to "crawler_output/art_ontology_en.json".
        header: Header for the rdf file which is inserted at the begining. Defaults to "art_ontology_header.txt".
        ontology: Output file. Defaults to "crawler_output/art_ontology_en.ttl".

    Raises:
        Exception: If an unexpected type is in the art_ontology_en.json an error is thrown
    """
    print(datetime.datetime.now(), "Start reading the JSON-file")
    print("filename is " + str(file))

    artworks = []
    movements = []
    genres = []
    locations = []
    materials = []
    motifs = []
    artists = []

    with open(file, newline="", encoding="utf-8") as input:
        json_data = json.load(input)
        for json_object in json_data:
            if json_object["type"] == "artwork":
                artworks.append(json_object)
            if json_object["type"] == "movement":
                movements.append(json_object)
            if json_object["type"] == "genre":
                genres.append(json_object)
            if json_object["type"] == "location":
                locations.append(json_object)
            if json_object["type"] == "material":
                materials.append(json_object)
            if json_object["type"] == "motif":
                motifs.append(json_object)
            if json_object["type"] == "artist":
                artists.append(json_object)

    configs = {
        # TODO: If classes should be used again they have to be loaded above
        # They're only contained in the classes.csv
        # there is no JSON for classes generated
        # 'classes': {'json_array': 'classes.csv', 'class': 'rdfs:Class'},
        "movements": {"json_array": json.dumps(movements), "class": ":movement"},
        "genre": {"json_array": json.dumps(genres), "class": ":genre"},
        "locations": {"json_array": json.dumps(locations), "class": ":location"},
        "materials": {"json_array": json.dumps(materials), "class": ":material"},
        "motifs": {"json_array": json.dumps(motifs), "class": ":motif"},
        "artists": {"json_array": json.dumps(artists), "class": ":artist"},
        "artworks": {"json_array": json.dumps(artworks), "class": ":artwork"},
    }

    properties = {
        "label": {"property": "rdfs:label", "type": "string"},
        "description": {"property": ":description", "type": "string"},
        "abstract": {"property": ":abstract", "type": "string"},
        "wikipediaLink": {"property": ":wikipediaLink", "type": "url"},
        "image": {"property": ":image", "type": "url"},
        "artists": {"property": ":artist", "type": "list"},
        "locations": {"property": ":location", "type": "list"},
        "genres": {"property": ":genre", "type": "list"},
        "movements": {"property": ":movement", "type": "list"},
        "inception": {"property": ":inception", "type": "number"},
        "materials": {"property": ":material", "type": "list"},
        "motifs": {"property": ":motif", "type": "list"},
        "country": {"property": ":country", "type": "string"},
        "height": {"property": ":height", "type": "number"},
        "height_unit": {"property": ":height_unit", "type": "string"},
        "width": {"property": ":width", "type": "number"},
        "width_unit": {"property": ":width_unit", "type": "string"},
        "length": {"property": ":length", "type": "number"},
        "length_unit": {"property": ":length_unit", "type": "string"},
        "diameter": {"property": ":diameter", "type": "number"},
        "diameter_unit": {"property": ":diameter_unit", "type": "string"},
        "gender": {"property": ":gender", "type": "string"},
        "date_of_birth": {"property": ":date_of_birth", "type": "number"},
        "date_of_death": {"property": ":date_of_death", "type": "number"},
        "place_of_birth": {"property": ":place_of_birth", "type": "string"},
        "place_of_death": {"property": ":place_of_death", "type": "string"},
        "influenced_by": {"property": ":influenced_by", "type": "list"},
        "website": {"property": ":website", "type": "url"},
        "part_of": {"property": ":part_of", "type": "list"},
        "has_part": {"property": ":has_part", "type": "list"},
        "lat": {"property": ":lat", "type": "number"},
        "lon": {"property": ":lon", "type": "number"},
        "subclass_of": {"property": "rdfs:subClassOf", "type": "list"},
        "videos": {"property": ":videos", "type": "url"},
        "main_subjects": {"property": ":main_subjects", "type": "list"},
        "start_time": {"property": ":start_time", "type": "number"},
        "end_time": {"property": ":end_time", "type": "number"},
    }

    quotechars = {
        "string": {"start": '"', "end": '"'},
        "url": {"start": "<", "end": ">"},
        "number": {"start": "", "end": ""},
    }

    print(datetime.datetime.now(), "Starting with", "generating rdf")
    with open(ontology, "w", newline="", encoding="utf-8") as output:
        with open(header, newline="", encoding="utf-8") as input:
            output.write(input.read())
            for config in configs:
                print("Generating entries for " + config)
                output.write("\n\n# " + config + "\n\n")
                json_data = json.loads(configs[config]["json_array"])
                for json_object in json_data:
                    output.write(
                        "wd:"
                        + json_object["id"]
                        + " rdf:type "
                        + configs[config]["class"]
                    )
                    classes = json_object["classes"]
                    for c in classes:
                        output.write(", wd:" + c)
                    for key in json_object:
                        if key in properties:
                            t = properties[key]["type"]
                            if t in quotechars.keys():
                                value = json_object[key]
                                if key == "videos":
                                    count = 0
                                    output.write(
                                        " ;\n    "
                                        + properties[key]["property"] + " "
                                    )
                                    for v in value:
                                        count += 1
                                        output.write(
                                            quotechars[t]["start"]
                                            + v
                                            + quotechars[t]["end"]
                                        )
                                        if count != len(value):
                                            output.write(" , ")
                                else:
                                    value = str(value)
                                    if uri_validator(value):
                                        result = urllib.parse.urlparse(value)
                                        value = f"{result.scheme}://{result.netloc}{urllib.parse.quote(result.path)}"
                                    if value != "":  # cell not empty
                                        if t == "string" and '"' in value:
                                            value = value.replace(
                                                '"', "'"
                                            )  # replace double quotes by single quotes
                                        if (
                                            key == "abstract"
                                        ):  # abstract need a \n character in string
                                            output.write(
                                                " ;\n    "
                                                + properties[key]["property"]
                                                + " "
                                                + quotechars[t]["start"]
                                                + value.replace("\n", "\\n").replace(
                                                    "\\", "\\\\"
                                                )
                                                + quotechars[t]["end"]
                                            )
                                        else:
                                            output.write(
                                                " ;\n    "
                                                + properties[key]["property"]
                                                + " "
                                                + quotechars[t]["start"]
                                                + value
                                                + quotechars[t]["end"]
                                            )
                            elif t == "list":
                                if (
                                    json_object[key] != ""
                                ):  # cell not empty - should not happen
                                    ids = json_object[
                                        key
                                    ]  # parses list of ids from string
                                    if (
                                        len(ids) != 0 and "" not in ids
                                    ):  # list should not be empty
                                        first = True
                                        output.write(
                                            " ;\n    "
                                            + properties[key]["property"]
                                            + " "
                                        )
                                        for id in ids:
                                            if first:
                                                first = False
                                            else:
                                                output.write(" , ")
                                            output.write("wd:" + id)
                            else:
                                raise Exception("Unexpected type: " + t)
                    output.write(" .\n")

    print(datetime.datetime.now(), "Finished with", "generating rdf")


if __name__ == "__main__":
    generate_rdf()
