@echo off
REM remove old container
docker rm -f elastic-dev

REM build container
docker build -t elastic-dev .

REM run container
START "Elasticsearch docker container" docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" --name "elastic-dev" elastic-dev

echo waiting until elasticsearch is up
:loop
REM Temporary file needed https://stackoverflow.com/questions/2768608/batch-equivalent-of-bash-backticks
timeout /T 2 /nobreak>nul

REM If the elastic is not up try again later
REM This part checks if the findstr command finds the string 200 ok if not we loop through the timeout part
curl -sI localhost:9200 | findstr "200 OK" 1>nul
if errorlevel 1 (
    goto :loop
) ELSE (
    goto :create-indices
)

:create-indices
REM If it's up run elasticsearch_helper.py
docker exec elastic-dev python3 /app/upload_to_elasticsearch/elasticsearch_helper.py /app/crawler_output/art_ontology.json )
