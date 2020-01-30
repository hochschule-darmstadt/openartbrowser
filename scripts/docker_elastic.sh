#!/bin/bash

# remove old container
docker rm -f elastic-dev

# build container
# use the --no-cache option if you want to completely rebuild the image
docker build -t elastic-dev .

# run container
docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" --name "elastic-dev" elastic-dev &

# wait until elasticsearch started
echo "waiting until elasticsearch is up"
elastic_up=""
while [ -z "$elastic_up" ]
do
	elastic_up=$(curl -sI localhost:9200 | grep "200 OK")
  sleep 2
done

# run elastic.py script inside the container
docker exec elastic-dev python3 /app/upload_to_elasticsearch/elasticsearch_helper.py /app/crawler_output/art_ontology.json
