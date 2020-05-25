@echo off

WHERE curl
IF %ERRORLEVEL% NEQ 0 (
    ECHO curl isn't installed but needed for this script
    exit
)

REM remove old container
docker rm -f elastic-dev

REM build container
REM use the --no-cache option if you want to completely rebuild the image
docker build -t elastic-dev .

REM run container
START "Elasticsearch docker container" docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" --name "elastic-dev" elastic-dev

echo waiting until elasticsearch is up
:loop
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
docker exec elastic-dev python3 /app/upload_to_elasticsearch/elasticsearch_helper.py /app/crawler_output/art_ontology.json
