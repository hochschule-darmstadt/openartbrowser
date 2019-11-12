FROM python:3 as Wikicrawler

WORKDIR /app

RUN pip install pywikibot

COPY ["./Wikidata crawler/", "/app"]
RUN ls -lah /app
RUN ["python", "/app/ArtOntologyCrawler.py", "-d"]
RUN mkdir /app/csv && mv *.csv /app/csv

# ------------------------------------------------

FROM node:latest as data_manipulator

WORKDIR /app
COPY --from=Wikicrawler /app/csv /app/
RUN mv creators.csv artists.csv 

COPY ["./data_manipulation/", "/app"]

RUN npm install

RUN touch objects.csv && ls -l /app

RUN node script_artworks.js && \
    node script_genres.js && \
    node script_movements.js && \
    node script_materials.js && \
    node script_objects.js && \
    node script_artist.js && \
    node script_locations.js && \
    node script_artworks_rank.js && \
    node script_genres_rank.js && \
    node script_movements_rank.js && \
    node script_materials_rank.js && \
    node script_objects_rank.js && \
    node script_artist_rank.js && \
    node script_locations_rank.js && \
    node script_flatten_rank.js

# -----------------------------------------

FROM docker.elastic.co/elasticsearch/elasticsearch:7.4.2

WORKDIR /app

RUN yum update && \
    yum install -y https://centos7.iuscommunity.org/ius-release.rpm && \
    yum install -y python36u python36u-pip

RUN pip3 install elasticsearch ijson

RUN mkdir /var/log/elasticsearch && \
    mkdir /var/lib/elasticsearch && \
    chown elasticsearch:elasticsearch /var/log/elasticsearch && \
    chown elasticsearch:elasticsearch /var/lib/elasticsearch

COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/

COPY --from=data_manipulator /app/master_flat_rank.json /app/master_flat.json

COPY ["./upload_to_elasticsearch/", "/app"]
