import json
import glob

result = []
for f in glob.glob("/home/mkherrabi/jsonData/*.json"):
    with open(f, "rb") as infile:
        result.append(json.load(infile))

    with open("/home/mkherrabi/jsonData/master.json", "w", encoding="utf-8") as outfile:
        json.dump(result, outfile)
