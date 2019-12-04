"""
Module to crawl artwork metadata from Wikidata and store them im *.csv files and a *.ttl file (RDF).
Can be executed in https://paws.wmflabs.org which provides Jupyter Notebooks for accessing Wikidata.
Requires being logged in at Wikimedia

Execute crawling using
extract_art_ontology()
This may take several hours.
"""

import pywikibot
from pywikibot import pagegenerators as pg
import csv
import datetime
import ast
import sys
import requests
import json
from language_helper import language_config_to_list as language_config

DEV = False
DEV_LIMIT = 5
languageValues = language_config()
languageKeys = [item[0] for item in languageValues] 

def get_abstract(page_id, language_code="en"):
    """Extracts the abstract for a given page_id and language

    page_id -- The wikipedia internal page id. This can be received from pywikibot pages.
    language_code -- e.g. 'en', 'de', ...
    """

    url = "https://{}.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&pageids={}".format(language_code, page_id)
    resp = requests.get(url)
    resp_obj = json.loads(resp.text)

    return resp_obj["query"]["pages"][str(page_id)]["extract"]


def extract_artworks(type_name, wikidata_id):
    """Extracts artworks metadata from Wikidata and stores them in a *.csv file.

    type_name -- e.g., 'drawings', will be used as filename
    wikidata_id -- e.g., 'wd:Q93184' Wikidata ID of a class; all instances of this class and all subclasses with label, artist, and image will be loaded.

    Examples:
    extract_artworks('drawings', 'wd:Q93184')
    extract_artworks('sculptures', 'wd:Q860861')
    extract_artworks('paintings', 'wd:Q3305213')
    """
    print(datetime.datetime.now(), "Starting with", type_name)
    QUERY = 'SELECT ?item ?sitelink WHERE {SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } ?cls wdt:P279* ' + wikidata_id + ' . ?item wdt:P31 ?cls; wdt:P170 ?artist; wdt:P18 ?image . }'
    # all artworks of this type (including subtypes) with label, artist, and image
    wikidata_site = pywikibot.Site("wikidata", "wikidata")
    items = pg.WikidataSPARQLPageGenerator(QUERY, site=wikidata_site)
    count = 0
    extract_dicts = []
    for item in items:
        if DEV and count > DEV_LIMIT:
            break

        # mandatory fields
        try:
            item_dict = item.get()
            label = item_dict["labels"]["en"]
            clm_dict = item_dict["claims"]
            classes = list(map(lambda clm: clm.getTarget().id, clm_dict["P31"]))
            image = clm_dict["P18"][0].getTarget().get_file_url()
            artists = list(map(lambda clm: clm.getTarget().id, clm_dict["P170"]))
        except:
            continue
            # optional fields
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
            sitelinks = item_dict["sitelinks"]
            wikpedia_page = pywikibot.Page(sitelinks["enwiki"])

            abstract = get_abstract(wikpedia_page.pageid)
            wikipedia_link = wikpedia_page.full_url()
        except:
            abstract = ""
            wikipedia_link = ""

        #print(str(count) + " ", end='')
        dict = {"id": item.id, "classes": classes, "label": label, "description": description, "image": image, "artists": artists, "locations": locations, "genres": genres,
         "movements": movements, "inception": inception, "materials": materials, "motifs": motifs, "country": country, "height": height, "width": width, "abstract": abstract, "wikipediaLink": wikipedia_link}


        # print(classes, item, label, description, image, artists, locations, genres, movements, inception, materials, motifs,  country, height, width)
        for langkey in languageKeys:
            try:
                labellang = item_dict["labels"][langkey]
            except:
                labellang = label
            try:
                descriptionlang = item_dict["descriptions"][langkey]
            except:
                descriptionlang =  description
            try:
                countrylang = clm_dict["P17"][0].getTarget().get()["labels"][langkey]
            except:
                countrylang = country
            dict.update({"label_"+langkey: labellang, "description_"+langkey: descriptionlang, "country_"+langkey: countrylang})
        extract_dicts.append(dict)
        count += 1

    print(datetime.datetime.now(), "Finished with", type_name)
    return extract_dicts


def extract_subjects(subject_type):
    """Extracts metadata from Wikidata of a certain subject type and stores them in a *.csv file

    subject_type -- one of 'genres', 'movements', 'materials', 'motifs', 'artists', 'locations'. Will be used as filename

    Precondition: Files 'paintings.csv', 'drawings.csv', 'sculptures.csv' must have been created before (function extract_artworks).
    Metadata for artworks in theses files will be stored.

    Examples:
    extract_subjects('genres')
    extract_subjects('movements')
    extract_subjects('materials')
    extract_subjects('motifs')
    extract_subjects('artists')
    extract_subjects('locations')
    """
    print(datetime.datetime.now(), "Starting with", subject_type)
    subjects = set()
    file_names = ['paintings.csv', 'drawings.csv', 'sculptures.csv']
    for file_name in file_names:
        with open(file_name, newline="", encoding='utf-8') as file:
            reader = csv.DictReader(file, delimiter=';', quotechar='"')
            for row in reader:
                item_subjects = ast.literal_eval(row[subject_type])  # parses list from string
                for subject in item_subjects:
                    subjects.add(subject)

    site = pywikibot.Site("wikidata", "wikidata")
    repo = site.data_repository()
    print("Total: ", len(subjects), subject_type)
    count = 0
    extract_dicts = []

    for subject in subjects:
        if DEV and count > DEV_LIMIT:
            break
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
        try:
            sitelinks = item_dict["sitelinks"]
            wikpedia_page = pywikibot.Page(sitelinks["enwiki"])

            abstract = get_abstract(wikpedia_page.pageid)
            wikipedia_link = wikpedia_page.full_url()
        except:
            abstract = ""
            wikipedia_link = ""
        subject_dict = {"id": item.id, "classes": classes, "label": label, "description": description, "image": image, "abstract": abstract, "wikipediaLink": wikipedia_link}
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
                influenced_by = list(map(lambda clm: clm.getTarget().id, clm_dict["P737"]))
            except:
                influenced_by = []
            
            for langkey in languageKeys:
                try:
                    genderlang = clm_dict["P21"][0].getTarget().get()["labels"][langkey]
                except:
                    genderlang = gender
                try:
                    citizenshiplang = clm_dict["P27"][0].getTarget().get()["labels"][langkey]
                except:
                    citizenshiplang = citizenship
                subject_dict.update({"gender_"+langkey: genderlang, "citizenship_"+langkey: citizenshiplang})

        if subject_type == "movements":
            try:
                influenced_by = list(map(lambda clm: clm.getTarget().id, clm_dict["P737"]))
            except:
                influenced_by = []

        if subject_type == "locations":
            try:
                country = clm_dict["P17"][0].getTarget().get()["labels"]["en"]
            except:
                country = ""
            for langkey in languageKeys:
                try:
                    countrylang = clm_dict["P17"][0].getTarget().get()["labels"][langkey]
                except:
                    countrylang = country
                subject_dict.update({"country_"+langkey: countrylang})
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
                labellang = label
            try:
                descriptionlang = item_dict["descriptions"][langkey]
            except:
                descriptionlang =  description
            subject_dict.update({"label_"+langkey: labellang, "description_"+langkey: descriptionlang})

        # add fields that are special for different subject types
        if subject_type == "artists":
            subject_dict.update({"gender": gender, "date_of_birth": date_of_birth, "date_of_death": date_of_death,
                                 "place_of_birth": place_of_birth, "place_of_death": place_of_death,
                                 "citizenship": citizenship, "movements": movements, "influenced_by": influenced_by})

        elif subject_type == "movements":
            subject_dict.update({"influenced_by": influenced_by})
        elif subject_type == "locations":
            subject_dict.update({"country": country, "website": website, "part_of": part_of, "lat": lat, "lon": lon})
        extract_dicts.append(subject_dict)
        count += 1

    print()
    print(datetime.datetime.now(), "Finished with", subject_type)
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
    file_names = ['paintings.csv', 'drawings.csv', 'sculptures.csv', 'genres.csv', 'movements.csv', 'materials.csv', 'motifs.csv', 'artists.csv', 'locations.csv']

    for file_name in file_names:
        with open(file_name, newline="", encoding='utf-8') as file:
            reader = csv.DictReader(file, delimiter=';', quotechar='"')
            for row in reader:
                item_classes = ast.literal_eval(row['classes'])  # parses list from string
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
        #print(str(count) + " ", end='')
    for cls in class_dict:
        extract_dicts.append(class_dict[cls])

    print()
    print(datetime.datetime.now(), "Finished with classes")
    return extract_dicts


def extract_class(cls, class_dict, repo):
    """Extracts metadata of a class and it superclasses from Wikidata and stores them in a dictionary

    cls -- ID of a Wikidata class
    class_dict -- dictionary with Wikidata ID as key and a dict of class attributes as value; will be updated
    repo -- Wikidata repository as accessed using pywikibot
    """
    if not cls in class_dict:
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
        class_dict[cls] = {"id": item.id, "label": label, "description": description, "subclass_of": subclass_of}
        for langkey in languageKeys:
            try:
                labellang = item_dict["labels"][langkey]
            except:
                labellang = label
            try:
                descriptionlang = item_dict["descriptions"][langkey]
            except:
                descriptionlang = description
            class_dict[cls].update({"label_"+langkey: labellang, "description_"+langkey: descriptionlang})
        for superclass in subclass_of:
            extract_class(superclass, class_dict, repo)


def merge_artworks():
    """Merges artworks from files 'paintings.json', 'drawings.json', 'sculptures.json' (function extract_artworks) and stores them in a new file artworks.json and artworks.csv
    """
    print(datetime.datetime.now(), "Starting with", "merging artworks")
    artworks = set()
    file_names = ['paintings.json', 'drawings.json', 'sculptures.json']
    extract_dicts = []

    for file_name in file_names:
        with open(file_name, encoding='utf-8') as input:
            object_array = json.load(input)
            for object in object_array:
                if not object['id'] in artworks:  # remove duplicates
                    object['type'] = 'artwork'
                    extract_dicts.append(object)
                    artworks.add(object['id'])

    print()
    print(datetime.datetime.now(), "Finished with", "merging artworks")
    return extract_dicts


def generate_rdf():
    """Generates an RDF Tutle file 'ArtOntology.ttl' from *.csv files generated by functions extract_artworks, extract_subjects, extract_classes and merge_artworks"""
    print(datetime.datetime.now(), "Starting with", "generating rdf")

    configs = {
        'classes': {'filename': 'classes.csv', 'class': 'rdfs:Class'},
        'movements': {'filename': 'movements.csv', 'class': ':movement'},
        'genre': {'filename': 'genres.csv', 'class': ':genre'},
        'locations': {'filename': 'locations.csv', 'class': ':location'},
        'materials': {'filename': 'materials.csv', 'class': ':material'},
        'motifs': {'filename': 'motifs.csv', 'class': ':motif'},
        'persons': {'filename': 'artists.csv', 'class': ':person'},
        'artworks': {'filename': 'artworks.csv', 'class': ':artwork'}
    }
    properties = {
        'label': {'property': 'rdfs:label', 'type': 'string'},
        'description': {'property': ':description', 'type': 'string'},
        'image': {'property': ':image', 'type': 'url'},
        'artists': {'property': ':artist', 'type': 'list'},
        'locations': {'property': ':location', 'type': 'list'},
        'genres': {'property': ':genre', 'type': 'list'},
        'movements': {'property': ':movement', 'type': 'list'},
        'inception': {'property': ':inception', 'type': 'number'},
        'materials': {'property': ':material', 'type': 'list'},
        'motifs': {'property': ':motifs', 'type': 'list'},
        'country': {'property': ':country', 'type': 'string'},
        'height': {'property': ':height', 'type': 'number'},
        'width': {'property': ':width', 'type': 'number'},
        'gender': {'property': ':gender', 'type': 'string'},
        'date_of_birth': {'property': ':date_of_birth', 'type': 'number'},
        'date_of_death': {'property': ':date_of_death', 'type': 'number'},
        'place_of_birth': {'property': ':place_of_birth', 'type': 'string'},
        'place_of_death': {'property': ':place_of_death', 'type': 'string'},
        'influenced_by': {'property': ':influenced_by', 'type': 'list'},
        'website': {'property': ':website', 'type': 'url'},
        'part_of': {'property': ':part_of', 'type': 'list'},
        'lat': {'property': ':lat', 'type': 'number'},
        'lon': {'property': ':lon', 'type': 'number'},
        'subclass_of': {'property': 'rdfs:subClassOf', 'type': 'list'}
    }
    quotechars = {
        'string': {'start': '"', 'end': '"'},
        'url': {'start': '<', 'end': '>'},
        'number': {'start': '', 'end': ''}
    }

    with open("ArtOntology.ttl", "w", newline="", encoding='utf-8') as output:
        with open('ArtOntologyHeader.txt', newline="", encoding='utf-8') as input:
            output.write(input.read())  # copy header

        for config in configs:
            print(config)
            output.write('\n\n\n# ' + config + '\n\n')
            with open(configs[config]['filename'], newline="", encoding='utf-8') as input:
                # count = 0
                reader = csv.DictReader(input, delimiter=';', quotechar='"')
                for row in reader:
                    # if count > 10:
                    # continue
                    # else:
                    # count +=1
                    output.write('wd:' + row['id'] + ' rdf:type ' + configs[config]['class'])
                    if 'classes' in row:  # classes.csv has no classes column
                        classes = ast.literal_eval(row['classes'])  # parses list of class names from string
                        for cls in classes:
                            output.write(', wd:' + cls)
                    for entry in row:
                        if entry in properties:
                            tpe = properties[entry]['type']
                            if tpe in quotechars.keys():
                                value = row[entry]
                                if value != '':  # cell not empty
                                    if tpe == 'string' and '"' in value:
                                        value = value.replace('"', "'")  # replace double quotes by single quotes
                                    output.write(' ;\n    ' + properties[entry]['property'] + ' ' + quotechars[tpe]['start'] + value + quotechars[tpe]['end'])
                            elif tpe == 'list':
                                if row[entry] != '':  # cell not empty - should not happen
                                    ids = ast.literal_eval(row[entry])  # parses list of ids from string
                                    if len(ids) > 0:
                                        first = True
                                        output.write(' ;\n    ' + properties[entry]['property'] + ' ')
                                        for id in ids:
                                            if first:
                                                first = False
                                            else:
                                                output.write(' , ')
                                            output.write('wd:' + id)
                            else:
                                raise Exception('Unexpected type: ' + tpe)
                    output.write(' .\n')

    print()
    print(datetime.datetime.now(), "Finished with", "generating rdf")

def get_fields(type_name):

    fields = ["id", "classes", "label", "description", "image", "abstract", "wikipediaLink"]
    for langkey in languageKeys:
        fields += ["label_"+langkey, "description_"+langkey]
    if type_name in ["drawings", "sculptures", "paintings", "artworks"]:
        fields += ["artists", "locations", "genres", "movements", "inception", "materials", "motifs", "country", "height", "width"]
        for langkey in languageKeys:
            fields += ["country_"+langkey]
    elif type_name == "artists":
        fields += ["gender", "date_of_birth", "date_of_death", "place_of_birth", "place_of_death", "citizenship", "movements", "influenced_by"]
        for langkey in languageKeys:
            fields += ["gender_"+langkey, "citizenship_"+langkey]
    elif type_name == "movements":
        fields += ["influenced_by"]
    elif type_name == "locations":
        fields += ["country", "website", "part_of", "lat", "lon"]
        for langkey in languageKeys:
            fields += ["country_"+langkey]
    elif type_name == "classes":
        fields = ["id", "label", "description", "subclass_of"]
        for langkey in languageKeys:
            fields += ["label_"+langkey, "description_"+langkey]
    return fields

def generate_csv(name, extract_dicts, fields):
    with open(name + ".csv", "w", newline="", encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fields, delimiter=';', quotechar='"')
        writer.writeheader()
        for extract_dict in extract_dicts:
            writer.writerow(extract_dict)

def generate_json(name, extract_dicts):
    with open(name + ".json", "w", newline="", encoding='utf-8') as file:
        file.write("[")
        for extract_dict in extract_dicts[:-1]:
            extract_dict["type"] = name[:-1]
            file.write(json.dumps(extract_dict, ensure_ascii=False))
            file.write(",")
        if len(extract_dicts) >= 1:
            extract_dicts[-1]["type"] = name[:-1]
        file.write(json.dumps(extract_dicts[-1], ensure_ascii=False))
        file.write("]")


def extract_art_ontology():
    """Extracts *.csv files and a *.ttl file with metadata for artworks from Wikidata"""

    for artwork, wd in [("drawings", "wd:Q93184"), ("sculptures", "wd:Q860861"), ("paintings", "wd:Q3305213")]:
        extracted_artwork = extract_artworks(artwork, wd)
        generate_csv(artwork, extracted_artwork, get_fields(artwork))
        generate_json(artwork, extracted_artwork)

    for subject in ["genres", "movements", "materials", "motifs", "artists", "locations"]:
        extracted_subject = extract_subjects(subject)
        generate_csv(subject, extracted_subject, get_fields(subject))
        generate_json(subject, extracted_subject)

    classes = "classes"
    generate_csv(classes, extract_classes(), get_fields(classes))

    artworks = "artworks"
    merged_artworks = merge_artworks()
    generate_csv(artworks, merged_artworks, get_fields(artworks) + ["type"])
    generate_json(artworks, merged_artworks)

    generate_rdf()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "-d":
        if len(sys.argv) > 2 and sys.argv[2].isdigit():
            DEV_LIMIT = sys.argv[2]
        print("DEV MODE: on, DEV_LIM={}".format(DEV_LIMIT))
        DEV = True

    print("Extracting Art Ontology")
    extract_art_ontology()
