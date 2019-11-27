FROM python:3 as Wikicrawler

WORKDIR /app

RUN pip install pywikibot

COPY ["./Wikidata crawler/", "/app"]
# run ArtOntologyCrawler in development mode
RUN ["python", "/app/ArtOntologyCrawler.py", "-d"]
RUN ls -lah /app/
# move all files needed by the next stage into output_data
RUN mkdir /app/output_data && mv *.json /app/output_data && mv *.csv /app/output_data

# ------------------------------------------------

FROM node:latest as data_manipulator

WORKDIR /app
# get files from previous stage
COPY --from=Wikicrawler /app/output_data /app/

COPY ["./data_manipulation/", "/app"]

RUN npm install

RUN node script_artworks.js && \
    node script_artworks_rank.js && \
    node script_genres_rank.js && \
    node script_artist_rank.js && \
    node script_locations_rank.js && \
    node script_materials_rank.js && \
    node script_movements_rank.js && \
    node script_motifs_rank.js && \
    node script_flatten_rank.js

# -----------------------------------------

FROM docker.elastic.co/elasticsearch/elasticsearch:7.4.2

WORKDIR /app

RUN yum update && \
    yum install -y https://centos7.iuscommunity.org/ius-release.rpm && \
    yum install -y python36u python36u-pip

RUN pip3 install elasticsearch ijson requests

RUN mkdir /var/log/elasticsearch && \
    mkdir /var/lib/elasticsearch && \
    chown elasticsearch:elasticsearch /var/log/elasticsearch && \
    chown elasticsearch:elasticsearch /var/lib/elasticsearch

# copy elasticsearch config from repo into docker container
COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/

# master_flat_rank.json is moved to /root becasuse elasticsearch_helper.py expects the json file in the
# home directory
COPY --from=data_manipulator /app/master_flat_rank.json /root/master_flat.json

COPY ["./upload_to_elasticsearch/", "/app"]
