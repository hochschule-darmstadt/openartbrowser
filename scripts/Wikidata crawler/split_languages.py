#splits master file into languages
import sys
import simplejson as json
import ijson
#from ArtOntologyCrawler import readLanguageConfigFile
from language_helper import generate_langdict_arrays as confdicts
from language_helper import readLanguageConfigFile as confkeys

filename = "/home/mkherrabi/jsonData/master_flat.json"

#load languageconfig file with keys / language dicts
langconfig_array = confdicts()
langconfig_keys = confkeys()

#modifies lang dictionary data by manipulating key values or deleting keys
#mostly used to get rid of additional language keys
def modify_langdict(langdict, jsonobject, langkey):
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
     with open(name + ".json", "w", newline="", encoding='utf-8') as file:
         file.write(json.dumps(extract_dicts))
        


for item in ijson.items(open(filename, 'r', encoding='utf-8'), 'item'):
    i = 0
    while i < len(langconfig_keys):
        langconfig_array[i] = modify_langdict(langconfig_array[i], item, langconfig_keys[i])
        i += 1  


i = 0
while i < len(langconfig_array):
    generate_langjson('master_' + langconfig_keys[i], langconfig_array[i])
    i += 1