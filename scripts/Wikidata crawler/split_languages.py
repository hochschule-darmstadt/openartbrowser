#splits master file into languages

import sys
import simplejson as json
import ijson
import os
#from ArtOntologyCrawler import readLanguageConfigFile
from language_helper import generate_langdict_arrays as confdicts
from language_helper import read_language_config as confkeys
from language_helper import read_full_language_config as confcont

#filename = "/home/mkherrabi/jsonData/master_flat.json"
filename = os.path.dirname(os.path.dirname((os.path.abspath(__file__)))) + "\\crawler_output\\art_ontology.json"

languagedata = confcont()

def fill_language_gaps(element, jsonobject):
    """[Fills language data into empty elements based on priority, 
    which is the languageconfig.csv order]
    
    Arguments:
        element {[string]} -- [Name of the key which is in need of gap filling]
        jsonobject {[dict]} -- [Relevant which contains all data specific to the element]
        Returns:
        [dict] -- [Updated json file with language gaps filled in / or not if no language data existant]
    """
    for row in languagedata:
        try:
            #Skip empty language data
            if not jsonobject[element + '_' + row[0]]:
                next
            #Assign language data to element and fill in which language is used
            else:
                jsonobject[element] = jsonobject[element + '_' + row[0]] + ' (' + row[1] + ')'
        #Should not happen if key attributes in json are atleast existent
        except KeyError:
            if(element == "label") or (element == "description"):
                print("Warning! 'label' or 'description' language data might not exist fully in master.json"
                 + ". Id of .json-object: " + jsonobject['id'])
            pass
    return jsonobject




def modify_langdict(langdict, jsonobject, langkey):
    """[modifies lang dictionary data by manipulating key values or deleting keys 
                mostly used to get rid of additional language keys]
    
    Arguments:
        langdict {[array[dict]]} -- [internal language container for the language specified
                in langkey]
        jsonobject {[dict]} -- [json object from master file that is passed to our
                internal dictionaries]
        langkey {[str]} -- [language key used for modification]
    
    Returns:
        [array[dict]] -- [modified language container]
    """
    #Language keys that need language specific handling
    lang_elements = ["label", "description", "gender", "citizenship", "country"]
    tempjson = jsonobject.copy()
    delete_keys = []
    for element in lang_elements:
        try:
            if not tempjson[element + '_' +langkey]:                
                #print("langkey = " + langkey +"tempjson[element + '_' +langkey] = " + tempjson[element + '_' +langkey])
                tempjson = fill_language_gaps(element, tempjson)
            else:
                tempjson[element] = tempjson[element + '_' +langkey]
            # Using dictionary comprehension to find keys for deletion later
            dltkey = [key for key in tempjson if element + '_' in key]
            delete_keys.extend(dltkey)
        #Ignore if key doesnt exist
        except KeyError:
            if(element == "label") or (element == "description"):
                print("Warning! 'label' or 'description' language data might not exist fully in master.json"
                 + ". Id of .json-object: " + tempjson['id'])
            pass
    # delete the keys 
    for key in delete_keys: 
       del tempjson[key]  
    
    langdict.append(tempjson)
    return langdict

#writes temporary language specific data to language files 
def generate_langjson(name, extract_dicts):
    """[writes temporary language specific data to language files]
    
    Arguments:
        name {[str]} -- [Name of the generated json language file]
        extract_dicts {[dict]} -- [dictionary that is written into the output file]
    """
    with open(name + ".json", "w", newline="", encoding='utf-8') as file:
        file.write(json.dumps(extract_dicts, ensure_ascii=False))
        
#load languageconfig file with keys / language dicts
langconfig_array = confdicts()
langconfig_keys = confkeys()

#iterate through all json object in the master file
for item in ijson.items(open(filename, 'r', encoding='utf-8'), 'item'):
    i = 0
    #iterate through all language keys and write the json object
    #in an modified state into the language dictionary arrays
    while i < len(langconfig_keys):
        langconfig_array[i] = modify_langdict(langconfig_array[i], item, langconfig_keys[i])
        i += 1  


i = 0
#generate one master file per language defined in config file.
#fill the contents of the respective language dicitonary arrays into the files
while i < len(langconfig_array):
    generate_langjson('master_' + langconfig_keys[i], langconfig_array[i])
    i += 1