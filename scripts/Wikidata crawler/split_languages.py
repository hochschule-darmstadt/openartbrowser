#splits master file into languages
import sys
import simplejson as json
import ijson
#from ArtOntologyCrawler import readLanguageConfigFile
from language_helper import generate_langdict_arrays as confdicts
from language_helper import read_language_config as confkeys

filename = "/home/mkherrabi/jsonData/master_flat.json"


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
    tempjson = jsonobject.copy()
    try:
        tempjson["label"] = tempjson["label_" + langkey]
    except:
        tempjson["label"] = tempjson["label"]
    try:
        tempjson["description"] = tempjson["description_" + langkey]
    except:
        tempjson["description"] = tempjson["description"]


    # Using dictionary comprehension to find keys         
    delete_keys = [key for key in tempjson if 'label_' in key 
     or 'description_' in key
     ] 
  
    # delete the keys 
    for key in delete_keys: 
       del tempjson[key]  
    
    #print(tempjson)
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
        file.write(json.dumps(extract_dicts))
        
#load languageconfig file with keys / language dicts
langconfig_array = confdicts()
langconfig_keys = confkeys()

#iterate through all json object in the master file
for item in ijson.items(open(filename, 'r', encoding='utf-8'), 'item'):
    i = 0
    #iterate through alle language keys and write the json object
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