"""
Module to crawl artwork metadata from Wikidata and Wikipedia and store them im *.csv and *.json files.
Is executed weekly on the staging server on tuesday 0:00.
Requires being logged in at Wikimedia.
This is done by the user-config.py in the scripts directory.

Execute crawling using
extract_art_ontology()
This may take several days.
"""

import pywikibot
from pywikibot import pagegenerators as pg
import csv
import datetime
import ast
import sys
import requests
import json
from pathlib import Path

DEV = False
DEV_LIMIT = 10


def get_abstract(page_id, language_code):
    """Extracts the abstract for a given page_id and language

    page_id -- The wikipedia internal page id. This can be received from pywikibot pages.
    language_code -- e.g. 'en', 'de', ...
    """

    url = "https://{}.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&pageids={}".format(
        language_code, page_id
    )
    resp = requests.get(url)
    resp_obj = json.loads(resp.text)

    return resp_obj["query"]["pages"][str(page_id)]["extract"]


def language_config_to_list(
    config_file=Path(__file__).parent.parent.absolute() / "languageconfig.csv",
):
    """Reads languageconfig.csv and returns array that contains its
    full contents

    Returns:
        list -- contents of languageconfig.csv as list
    """
    languageValues = []
    with open(config_file, encoding="utf-8") as file:
        configReader = csv.reader(file, delimiter=";")
        for row in configReader:
            if row[0] != "langkey":
                languageValues.append(row)
    return languageValues


def extract_artworks(
    type_name, wikidata_id, languageKeys=[item[0] for item in language_config_to_list()]
):
    """Extracts artworks metadata from Wikidata and stores them in a dictionary.

    type_name -- e.g., 'drawings', will be used as filename
    wikidata_id -- e.g., 'wd:Q93184' Wikidata ID of a class; all instances of this class and all subclasses with label, artist, and image will be loaded.
    languageKeys -- e.g, list('en', 'de')

    Examples:
    extract_artworks('drawings', 'wd:Q93184', '('en', 'de'))
    extract_artworks('sculptures', 'wd:Q860861', '('en', 'de'))
    extract_artworks('paintings', 'wd:Q3305213', '('en', 'de'))
    """
    print(datetime.datetime.now(), "Starting with", type_name)
    QUERY = (
        'SELECT ?item ?sitelink WHERE {SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } ?cls wdt:P279* '
        + wikidata_id
        + " . ?item wdt:P31 ?cls; wdt:P18 ?image . }"
    )
    # all artworks of this type (including subtypes) with label, artist, and image
    wikidata_site = pywikibot.Site("wikidata", "wikidata")
    items = pg.WikidataSPARQLPageGenerator(QUERY, site=wikidata_site)
    count = 0
    extract_dicts = []
    for item in items:
        if DEV and count > int(DEV_LIMIT):
            break

        # Loading the item and claims is mandatory. The only mandatory field is the image.
        # The try-catch-blocks have to stay because anyone can input anything on wikidata
        try:
            item_dict = item.get()
            clm_dict = item_dict["claims"]
            image = clm_dict["P18"][0].getTarget().get_file_url()
        except:
            continue
        # optional fields
        try:
            label = item_dict["labels"]["en"]
        except:
            label = ""
        try:
            classes = list(map(lambda clm: clm.getTarget().id, clm_dict["P31"]))
        except:
            classes = []
        try:
            artists = list(map(lambda clm: clm.getTarget().id, clm_dict["P170"]))
        except:
            artists = []
        try:
            description = item_dict["descriptions"]["en"]
        except:
            description = ""
        try:
            locations = list(map(lambda clm: clm.getTarget().id, clm_dict["P276"]))
        except:
            locations = []
        try:
            genres = list(map(lambda clm: clm.getTarget().id, clm_dict["P136"]))
        except:
            genres = []
        try:
            movements = list(map(lambda clm: clm.getTarget().id, clm_dict["P135"]))
        except:
            movements = []
        try:
            inception = clm_dict["P571"][0].getTarget().year
        except:
            inception = ""
        try:
            materials = list(map(lambda clm: clm.getTarget().id, clm_dict["P186"]))
        except:
            materials = []
        try:
            motifs = list(map(lambda clm: clm.getTarget().id, clm_dict["P180"]))
        except:
            motifs = []
        try:
            country = clm_dict["P17"][0].getTarget().get()["labels"]["en"]
        except:
            country = ""
        try:
            height = str(clm_dict["P2048"][0].getTarget().amount)
        except:
            height = ""
        try:
            width = str(clm_dict["P2049"][0].getTarget().amount)
        except:
            width = ""
        try:
            iconclasses = list(map(lambda clm: clm.getTarget(), clm_dict["P1257"]))
        except:
            iconclasses = []
        try:
            main_subjects = list(map(lambda clm: clm.getTarget().id, clm_dict["P921"]))
        except:
            main_subjects = []

        # print(str(count) + " ", end='')
        dict = {
            "id": item.id,
            "classes": classes,
            "label": label,
            "description": description,
            "image": image,
            "artists": artists,
            "locations": locations,
            "genres": genres,
            "movements": movements,
            "inception": inception,
            "materials": materials,
            "motifs": motifs,
            "country": country,
            "height": height,
            "width": width,
            "iconclasses": iconclasses,
            "main_subjects": main_subjects,
        }

        # print(classes, item, label, description, image, artists, locations, genres, movements, inception, materials, motifs,  country, height, width)
        for langkey in languageKeys:
            try:
                labellang = item_dict["labels"][langkey]
            except:
                labellang = ""
            try:
                descriptionlang = item_dict["descriptions"][langkey]
            except:
                descriptionlang = ""
            try:
                countrylang = clm_dict["P17"][0].getTarget().get()["labels"][langkey]
            except:
                countrylang = ""
            try:
                sitelinks = item_dict["sitelinks"]
                wikpedia_page = pywikibot.Page(sitelinks[langkey + "wiki"])
                abstract_lang = get_abstract(wikpedia_page.pageid, langkey)
                wikipedia_link_lang = wikpedia_page.full_url()
            except:
                abstract_lang = ""
                wikipedia_link_lang = ""
            dict.update(
                {
                    "label_" + langkey: labellang,
                    "description_" + langkey: descriptionlang,
                    "country_" + langkey: countrylang,
                    "abstract_" + langkey: abstract_lang,
                    "wikipediaLink_" + langkey: wikipedia_link_lang,
                }
            )
        extract_dicts.append(dict)
        count += 1

    print(datetime.datetime.now(), "Finished with", type_name)
    print()
    return extract_dicts


def extract_subjects(
    subject_type, languageKeys=[item[0] for item in language_config_to_list()]
):
    """Extracts metadata from Wikidata of a certain subject type and stores them in a dictionary.

    subject_type -- one of 'genres', 'movements', 'materials', 'motifs', 'artists', 'locations'. Will be used as filename
    languageKeys -- e.g, list('en', 'de')

    Precondition: Files 'paintings.csv', 'drawings.csv', 'sculptures.csv' must have been created before (function extract_artworks).
    Metadata for artworks in theses files will be stored.

    Examples:
    extract_subjects('genres', list('en', 'de'))
    extract_subjects('movements', list('en', 'de'))
    extract_subjects('materials', list('en', 'de'))
    extract_subjects('motifs', list('en', 'de'))
    extract_subjects('artists', list('en', 'de'))
    extract_subjects('locations', list('en', 'de'))
    """
    print(datetime.datetime.now(), "Starting with", subject_type)
    subjects = set()
    file_names = ["paintings.csv", "drawings.csv", "sculptures.csv"]
    file_names = [
        Path.cwd()
        / "crawler_output"
        / "intermediate_files"
        / "csv"
        / "artworks"
        / file_name
        for file_name in file_names
    ]
    for file_name in file_names:
        with open(file_name, newline="", encoding="utf-8") as file:
            reader = csv.DictReader(file, delimiter=";", quotechar='"')
            for row in reader:
                item_subjects = list(
                    ast.literal_eval(row[subject_type])
                )  # parses list from string
                if subject_type == "motifs":
                    main_subjects = list(ast.literal_eval(row["main_subjects"]))
                    for main_subject in main_subjects:
                        if main_subject not in item_subjects:
                            item_subjects.append(main_subject)
                for subject in item_subjects:
                    subjects.add(subject)

    site = pywikibot.Site("wikidata", "wikidata")
    repo = site.data_repository()
    print("Total: ", len(subjects), subject_type)
    count = 0
    extract_dicts = []

    for subject in subjects:
        if DEV and count > int(DEV_LIMIT):
            break
        # The try-catch-blocks have to stay because anyone can input anything on wikidata
        try:
            item = pywikibot.ItemPage(repo, subject)
            item_dict = item.get()
            clm_dict = item_dict["claims"]
        except:
            continue
        try:
            classes = list(map(lambda clm: clm.getTarget().id, clm_dict["P31"]))
        except:
            classes = []
        try:
            label = item_dict["labels"]["en"]
        except:
            label = ""
        try:
            description = item_dict["descriptions"]["en"]
        except:
            description = ""
        try:
            image = clm_dict["P18"][0].getTarget().get_file_url()
        except:
            image = ""
        subject_dict = {
            "id": item.id,
            "classes": classes,
            "label": label,
            "description": description,
            "image": image,
        }
        if subject_type == "artists":
            try:
                gender = clm_dict["P21"][0].getTarget().get()["labels"]["en"]
            except:
                gender = ""
            try:
                date_of_birth = clm_dict["P569"][0].getTarget().year
            except:
                date_of_birth = ""
            try:
                date_of_death = clm_dict["P570"][0].getTarget().year
            except:
                date_of_death = ""
            try:
                place_of_birth = clm_dict["P19"][0].getTarget().get()["labels"]["en"]
            except:
                place_of_birth = ""
            try:
                place_of_death = clm_dict["P20"][0].getTarget().get()["labels"]["en"]
            except:
                place_of_death = ""
            try:
                citizenship = clm_dict["P27"][0].getTarget().get()["labels"]["en"]
            except:
                citizenship = ""
            try:
                movements = list(map(lambda clm: clm.getTarget().id, clm_dict["P135"]))
            except:
                movements = []
            try:
                influenced_by = list(
                    map(lambda clm: clm.getTarget().id, clm_dict["P737"])
                )
            except:
                influenced_by = []

            for langkey in languageKeys:
                try:
                    genderlang = clm_dict["P21"][0].getTarget().get()["labels"][langkey]
                except:
                    genderlang = ""
                try:
                    citizenshiplang = (
                        clm_dict["P27"][0].getTarget().get()["labels"][langkey]
                    )
                except:
                    citizenshiplang = ""
                subject_dict.update(
                    {
                        "gender_" + langkey: genderlang,
                        "citizenship_" + langkey: citizenshiplang,
                    }
                )

        if subject_type == "movements":
            try:
                influenced_by = list(
                    map(lambda clm: clm.getTarget().id, clm_dict["P737"])
                )
            except:
                influenced_by = []

        if subject_type == "locations":
            try:
                country = clm_dict["P17"][0].getTarget().get()["labels"]["en"]
            except:
                country = ""
            for langkey in languageKeys:
                try:
                    countrylang = (
                        clm_dict["P17"][0].getTarget().get()["labels"][langkey]
                    )
                except:
                    countrylang = ""
                subject_dict.update({"country_" + langkey: countrylang})
            try:
                website = clm_dict["P856"][0].getTarget()
            except:
                website = ""
            try:
                part_of = list(map(lambda clm: clm.getTarget().id, clm_dict["P361"]))
            except:
                part_of = []
            try:
                coordinate = clm_dict["P625"][0].getTarget()
                lat = coordinate.lat
                lon = coordinate.lon
            except:
                lat = ""
                lon = ""

        for langkey in languageKeys:
            try:
                labellang = item_dict["labels"][langkey]
            except:
                labellang = ""
            try:
                descriptionlang = item_dict["descriptions"][langkey]
            except:
                descriptionlang = ""
            try:
                sitelinks = item_dict["sitelinks"]
                wikpedia_page = pywikibot.Page(sitelinks[langkey + "wiki"])
                abstract_lang = get_abstract(wikpedia_page.pageid, langkey)
                wikipedia_link_lang = wikpedia_page.full_url()
            except:
                abstract_lang = ""
                wikipedia_link_lang = ""
            subject_dict.update(
                {
                    "label_" + langkey: labellang,
                    "description_" + langkey: descriptionlang,
                    "abstract_" + langkey: abstract_lang,
                    "wikipediaLink_" + langkey: wikipedia_link_lang,
                }
            )

        # add fields that are special for different subject types
        if subject_type == "artists":
            subject_dict.update(
                {
                    "gender": gender,
                    "date_of_birth": date_of_birth,
                    "date_of_death": date_of_death,
                    "place_of_birth": place_of_birth,
                    "place_of_death": place_of_death,
                    "citizenship": citizenship,
                    "movements": movements,
                    "influenced_by": influenced_by,
                }
            )

        elif subject_type == "movements":
            subject_dict.update({"influenced_by": influenced_by})
        elif subject_type == "locations":
            subject_dict.update(
                {
                    "country": country,
                    "website": website,
                    "part_of": part_of,
                    "lat": lat,
                    "lon": lon,
                }
            )
        extract_dicts.append(subject_dict)
        count += 1

    print(datetime.datetime.now(), "Finished with", subject_type)
    print()
    return extract_dicts


def extract_classes():
    """Extracts metadata of classes from Wikidata and stores them in a *.csv file


    Precondition: Files 'paintings.csv', 'drawings.csv', 'sculptures.csv', 'genres.csv', 'movements.csv',
                        'materials.csv', 'motifs.csv', 'artists.csv', 'locations.csv'
                  must have been created before (functions extract_artworks and extract_subjects).
    Metadata for classes referenced in theses files will be stored.
    """
    print(datetime.datetime.now(), "Starting with classes")
    classes = set()
    class_dict = dict()
    subjects = [
        "genres.csv",
        "movements.csv",
        "materials.csv",
        "motifs.csv",
        "artists.csv",
        "locations.csv",
    ]
    artworks = ["paintings.csv", "drawings.csv", "sculptures.csv"]

    base_dir = Path.cwd() / "crawler_output" / "intermediate_files" / "csv"
    file_names = [base_dir / subject for subject in subjects] + [
        base_dir / "artworks" / artwork for artwork in artworks
    ]
    for file_name in file_names:
        with open(file_name, newline="", encoding="utf-8") as file:
            reader = csv.DictReader(file, delimiter=";", quotechar='"')
            for row in reader:
                item_classes = ast.literal_eval(
                    row["classes"]
                )  # parses list from string
                for item_class in item_classes:
                    classes.add(item_class)

    site = pywikibot.Site("wikidata", "wikidata")
    repo = site.data_repository()
    print("Total: ", len(classes), "classes")
    count = 0
    extract_dicts = []

    for cls in classes:
        if DEV and count > 10:
            break
        extract_class(cls, class_dict, repo)
        count += 1
        # print(str(count) + " ", end='')
    for cls in class_dict:
        extract_dicts.append(class_dict[cls])

    print(datetime.datetime.now(), "Finished with classes")
    print()
    return extract_dicts


def extract_class(
    cls, class_dict, repo, languageKeys=[item[0] for item in language_config_to_list()]
):
    """Extracts metadata of a class and it superclasses from Wikidata and stores them in a dictionary.

    cls -- ID of a Wikidata class
    class_dict -- dictionary with Wikidata ID as key and a dict of class attributes as value; will be updated
    repo -- Wikidata repository as accessed using pywikibot
    """
    if cls not in class_dict:
        # The try-catch-blocks have to stay because anyone can input anything on wikidata
        try:
            item = pywikibot.ItemPage(repo, cls)
            item_dict = item.get()
            clm_dict = item_dict["claims"]
        except:
            print("except " + str(cls))
            return
        try:
            label = item_dict["labels"]["en"]
        except:
            label = ""
        try:
            description = item_dict["descriptions"]["en"]
        except:
            description = ""
        try:
            subclass_of = list(map(lambda clm: clm.getTarget().id, clm_dict["P279"]))
        except:
            subclass_of = []
        class_dict[cls] = {
            "id": item.id,
            "label": label,
            "description": description,
            "subclass_of": subclass_of,
        }
        for langkey in languageKeys:
            try:
                labellang = item_dict["labels"][langkey]
            except:
                labellang = ""
            try:
                descriptionlang = item_dict["descriptions"][langkey]
            except:
                descriptionlang = ""
            class_dict[cls].update(
                {
                    "label_" + langkey: labellang,
                    "description_" + langkey: descriptionlang,
                }
            )
        for superclass in subclass_of:
            extract_class(superclass, class_dict, repo)


def merge_artworks():
    """ Merges artworks from files 'paintings.json', 'drawings.json',
        'sculptures.json' (function extract_artworks) and
        stores them in a dictionary.
    """
    print(datetime.datetime.now(), "Starting with", "merging artworks")
    artworks = set()
    file_names = ["paintings.json", "drawings.json", "sculptures.json"]
    file_names = [
        Path.cwd()
        / "crawler_output"
        / "intermediate_files"
        / "json"
        / "artworks"
        / file_name
        for file_name in file_names
    ]
    extract_dicts = []

    for file_name in file_names:
        with open(file_name, encoding="utf-8") as input:
            object_array = json.load(input)
            for object in object_array:
                if not object["id"] in artworks:  # remove duplicates
                    object["type"] = "artwork"
                    extract_dicts.append(object)
                    artworks.add(object["id"])

    print(datetime.datetime.now(), "Finished with", "merging artworks")
    print()
    return extract_dicts


def get_fields(type_name, languageKeys=[item[0] for item in language_config_to_list()]):
    """ Returns all fields / columns for a specific type, e. g. 'artworks' """
    fields = ["id", "classes", "label", "description", "image"]
    for langkey in languageKeys:
        fields += [
            "label_" + langkey,
            "description_" + langkey,
            "abstract_" + langkey,
            "wikipediaLink_" + langkey,
        ]
    if type_name in ["drawings", "sculptures", "paintings", "artworks"]:
        fields += [
            "artists",
            "locations",
            "genres",
            "movements",
            "inception",
            "materials",
            "motifs",
            "country",
            "height",
            "width",
            "iconclasses",
            "main_subjects",
        ]
        for langkey in languageKeys:
            fields += ["country_" + langkey]
    elif type_name == "artists":
        fields += [
            "gender",
            "date_of_birth",
            "date_of_death",
            "place_of_birth",
            "place_of_death",
            "citizenship",
            "movements",
            "influenced_by",
        ]
        for langkey in languageKeys:
            fields += ["gender_" + langkey, "citizenship_" + langkey]
    elif type_name == "movements":
        fields += ["influenced_by"]
    elif type_name == "locations":
        fields += ["country", "website", "part_of", "lat", "lon"]
        for langkey in languageKeys:
            fields += ["country_" + langkey]
    elif type_name == "classes":
        fields = ["id", "label", "description", "subclass_of"]
        for langkey in languageKeys:
            fields += ["label_" + langkey, "description_" + langkey]
    return fields


def generate_csv(name, extract_dicts, fields, filename):
    """ Generates a csv file from a dictionary """
    filename.parent.mkdir(parents=True, exist_ok=True)
    with open(filename.with_suffix(".csv"), "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fields, delimiter=";", quotechar='"')
        writer.writeheader()
        for extract_dict in extract_dicts:
            writer.writerow(extract_dict)


def generate_json(name, extract_dicts, filename):
    """ Generates a JSON file from a dictionary """
    if len(extract_dicts) == 0:
        return
    filename.parent.mkdir(parents=True, exist_ok=True)
    with open(filename.with_suffix(".json"), "w", newline="", encoding="utf-8") as file:
        arrayToDump = []
        for extract_dict in extract_dicts:
            extract_dict["type"] = name[
                :-1
            ]  # name[:-1] removes the last character of the name
            arrayToDump.append(extract_dict)
        file.write(json.dumps(arrayToDump, ensure_ascii=False))


def extract_art_ontology():
    """ Extracts *.csv and *.JSON files for artworks from Wikidata """

    for artwork, wd in [
        ("drawings", "wd:Q93184"),
        ("sculptures", "wd:Q860861"),
        ("paintings", "wd:Q3305213"),
    ]:
        extracted_artwork = extract_artworks(artwork, wd)

        filename = (
            Path.cwd()
            / "crawler_output"
            / "intermediate_files"
            / "csv"
            / "artworks"
            / artwork
        )
        generate_csv(artwork, extracted_artwork, get_fields(artwork), filename)

        filename = (
            Path.cwd()
            / "crawler_output"
            / "intermediate_files"
            / "json"
            / "artworks"
            / artwork
        )
        generate_json(artwork, extracted_artwork, filename)

    for subject in [
        "genres",
        "movements",
        "materials",
        "motifs",
        "artists",
        "locations",
    ]:
        extracted_subject = extract_subjects(subject)

        filename = (
            Path.cwd() / "crawler_output" / "intermediate_files" / "csv" / subject
        )
        generate_csv(subject, extracted_subject, get_fields(subject), filename)

        filename = (
            Path.cwd() / "crawler_output" / "intermediate_files" / "json" / subject
        )
        generate_json(subject, extracted_subject, filename)

    classes = "classes"
    filename = Path.cwd() / "crawler_output" / "intermediate_files" / "csv" / classes
    generate_csv(classes, extract_classes(), get_fields(classes), filename)

    artworks = "artworks"
    merged_artworks = merge_artworks()

    filename = Path.cwd() / "crawler_output" / "intermediate_files" / "csv" / artworks
    generate_csv(artworks, merged_artworks, get_fields(artworks) + ["type"], filename)

    filename = Path.cwd() / "crawler_output" / "intermediate_files" / "json" / artworks
    generate_json(artworks, merged_artworks, filename)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "-d":
        if len(sys.argv) > 2 and sys.argv[2].isdigit():
            DEV_LIMIT = int(sys.argv[2])
        print("DEV MODE: on, DEV_LIM={}".format(DEV_LIMIT))
        DEV = True

    print("Extracting Art Ontology")
    extract_art_ontology()
