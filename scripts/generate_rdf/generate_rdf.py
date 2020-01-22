
import json
import datetime
import os
from pathlib import Path

fileName = Path(__file__).parent.parent.absolute() / "art_ontology_en.json"
def split_file_in_subtype():
    """Split *.art_ontology_en.json in subtype(Artworks, movements, locations, materials, motifs, Artists, genres)
    and store in multiple .json File"""
    print(datetime.datetime.now(), "Starting with", "generating json files")
    print("filename is "+ str(fileName))

    artworks = []
    movements = []
    genres =[]
    locations = []
    materials = []
    motifs = []
    artists = []
    with open(fileName, newline="", encoding='utf-8') as input:
        with open("artworks.json", "w", newline="", encoding='utf-8') as artworksFile:
            with open("movements.json", "w", newline="", encoding='utf-8') as movementsFile:
                with open("genres.json", "w", newline="", encoding='utf-8') as genresFile:
                    with open("locations.json", "w", newline="", encoding='utf-8') as locationsFile:
                        with open("materials.json", "w", newline="", encoding='utf-8') as materialsFile:
                            with open("motifs.json", "w", newline="", encoding='utf-8') as motifsFile:
                                with open("artists.json", "w", newline="", encoding='utf-8') as artistsFile:
                                    json_data  = json.load(input)
                                    print(json_data[0])


                                    for json_object in json_data:


                                        if json_object['type'] == "artwork":
                                            artworks.append(json_object)
                                        if json_object['type'] == "movement":
                                            movements.append(json_object)
                                        if json_object['type'] == "genre":
                                            genres.append(json_object)
                                        if json_object['type'] == "location":
                                            locations.append(json_object)
                                        if json_object['type'] == "material":
                                            materials.append(json_object)
                                        if json_object['type'] == "motif":
                                            motifs.append(json_object)
                                        if json_object['type'] == "artist":
                                            artists.append(json_object)

                                    artworksFile.write(json.dumps(artworks, ensure_ascii=False))
                                    movementsFile.write(json.dumps(movements, ensure_ascii=False))
                                    genresFile.write(json.dumps(genres, ensure_ascii=False))
                                    locationsFile.write(json.dumps(locations, ensure_ascii=False))
                                    materialsFile.write(json.dumps(materials, ensure_ascii=False))
                                    motifsFile.write(json.dumps(motifs, ensure_ascii=False))
                                    artistsFile.write(json.dumps(artists, ensure_ascii=False))
                                            #artistsFile.write(',')
    print(datetime.datetime.now(), "Finished with", "generating json Files")
def generate_rdf():
    """Generates an RDF Tutle file 'art_ontology_en.ttl' from *.json files"""
    split_file_in_subtype()


    configs = {
        #'classes': {'filename': 'classes.csv', 'class': 'rdfs:Class'},
        'movements': {'filename': 'movements.json', 'class': ':movement'},
        'genre': {'filename': 'genres.json', 'class': ':genre'},
        'locations': {'filename': 'locations.json', 'class': ':location'},
        'materials': {'filename': 'materials.json', 'class': ':material'},
        'motifs': {'filename': 'motifs.json', 'class': ':motif'},
        'artists': {'filename': 'artists.json', 'class': ':artist'},
        'artworks': {'filename': 'artworks.json', 'class': ':artwork'}
    }

    properties = {
        'label': {'property': 'rdfs:label', 'type': 'string'},
        'description': {'property': ':description', 'type': 'string'},
        'abstract':{'property': ':abstract', 'type':'string'},
        'wikipediaLink':{'property': ':wikipediaLink', 'type': 'url'},
        'image': {'property': ':image', 'type': 'url'},
        'artists': {'property': ':artist', 'type': 'list'},
        'locations': {'property': ':location', 'type': 'list'},
        'genres': {'property': ':genre', 'type': 'list'},
        'movements': {'property': ':movement', 'type': 'list'},
        'inception': {'property': ':inception', 'type': 'number'},
        'materials': {'property': ':material', 'type': 'list'},
        'motifs': {'property': ':motif', 'type': 'list'},
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
        'subclass_of': {'property': 'rdfs:subClassOf', 'type': 'list'},
        'videos': {'property': ':videos', 'type': 'url'}
    }
    quotechars = {
        'string': {'start': '"', 'end': '"'},
        'url': {'start': '<', 'end': '>'},
        'number': {'start': '', 'end': ''}
    }
    print(datetime.datetime.now(), "Starting with", "generating rdf")
    with open("art_ontology_en.ttl", "w", newline="", encoding='utf-8') as output:
        with open('art_ontology_header.txt', newline="", encoding='utf-8') as input:
            output.write(input.read())
            for config in configs:
                print(config)
                output.write('\n\n\n# ' + config + '\n\n')
                with open(configs[config]['filename'], newline="", encoding='utf-8') as file:
                    json_data  = json.load(file)
                    for json_object in json_data:
                        output.write('wd:' + json_object['id'] + ' rdf:type ' + configs[config]['class'])
                        classes = json_object['classes']
                        print("classes")
                        print(classes)
                        for cls in classes:
                            output.write(', wd:' + cls)
                        for key in json_object:
                            if key in properties:
                                tpe = properties[key]['type']
                                if tpe in quotechars.keys():
                                    value = json_object[key]
                                    if key == "videos":
                                        count = 0
                                        output.write( ' ;\n    ' + properties[key]['property'] + ' ')
                                        for vle in value:
                                            count += 1
                                            output.write(quotechars[tpe]['start'] + vle + quotechars[tpe]['end'])
                                            if count != len(value):
                                                output.write( ' , ')


                                    else:
                                        value = str(value)
                                        print("str(value)")
                                        print (value)
                                        if value != '':  # cell not empty
                                            if tpe == 'string' and '"' in value:
                                                value = value.replace('"', "'")  # replace double quotes by single quotes
                                                print("value")
                                                print(value)
                                            print("value2")
                                            print(value)
                                            if key == "abstract": # abstract need a \n character in string
                                                output.write(' ;\n    ' + properties[key]['property'] + ' ' + quotechars[tpe]['start'] + value.replace('\n', '\\n').replace('\\', '\\\\')+ quotechars[tpe]['end'])
                                            else:
                                                output.write(' ;\n    ' + properties[key]['property'] + ' ' + quotechars[tpe]['start'] + value + quotechars[tpe]['end'])

                                elif tpe == 'list':
                                    if json_object[key] != '':  # cell not empty - should not happen
                                        ids = json_object[key]  # parses list of ids from string
                                        print("ids")
                                        print(ids)
                                        print("ids-length")
                                        print(len(ids))
                                        if len(ids) != 0 and '' not in ids:  # list should not be empty
                                            first = True
                                            output.write( ' ;\n    ' + properties[key]['property'] + ' ')
                                            for id in ids:
                                                if first:
                                                    first = False
                                                else:
                                                    output.write( ' , ')
                                                output.write('wd:' + id)


                                else:
                                    raise Exception('Unexpected type: ' + tpe)
                        output.write(' .\n')

    print(datetime.datetime.now(), "Finished with", "generating rdf")



generate_rdf()

