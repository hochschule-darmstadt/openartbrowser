#!/bin/bash
# build container
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
docker exec elastic-dev python3 /app/elasticsearch_helper.py /master_flat.json
