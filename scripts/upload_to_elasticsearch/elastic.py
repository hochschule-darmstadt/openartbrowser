# insert json objects from master_flat.json into wiki_data Elasticsearch index
from elasticsearch import Elasticsearch, helpers
import sys, json
import ijson
myid = 1
es = Elasticsearch()
filename = "/home/mkherrabi/jsonData/master_flat.json"
for item in ijson.items(open(filename, 'r'), 'item'):
    es.create(index='wiki_data', doc_type='data', body=item, id=myid)
    myid +=1

