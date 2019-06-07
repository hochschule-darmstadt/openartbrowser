# TODO rename the folder pyScripts into something that related to the function (like scripts/Wikidata crawler)
# TODO add short description about what the function do
from elasticsearch import Elasticsearch, helpers
import sys, json
import ijson
myid = 1
es = Elasticsearch()
filename = "/home/mkherrabi/jsonData/master_flat.json"
for item in ijson.items(open(filename, 'r'), 'item'):
    es.create(index='wiki_data', doc_type='data', body=item, id=myid)
    myid +=1

