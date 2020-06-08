FROM python:3 as Wikicrawler

WORKDIR /app
# The pythonpath is needed for package/module imports
ENV PYTHONPATH "${PYTHONPATH}:/app"

RUN pip install pywikibot

#copy necessary files
COPY ["./data_extraction/", "/app/data_extraction"]
COPY ["./user-config.py", "/app"]
COPY ["./shared/", "/app/shared"]
# run ArtOntologyCrawler in development mode
RUN pip install SPARQLWrapper
RUN ["python", "/app/data_extraction/get_wikidata_items.py", "-d"]
RUN ["python", "/app/data_extraction/get_wikipedia_extracts.py"]


# ------------------------------------------------

FROM python:3 as pre_data_ranking
ENV PYTHONPATH "${PYTHONPATH}:/app"

WORKDIR /app

# get files from previous stage
COPY --from=Wikicrawler /app/crawler_output/ /app/crawler_output/

RUN mkdir data_manipulation
COPY ["./data_manipulation/estimate_movement_period.py", "/app/data_manipulation"]

RUN ls -lah /app/crawler_output/intermediate_files/json

RUN pip install pathlib ijson
RUN ["python", "./data_manipulation/estimate_movement_period.py", "-d"]

# ------------------------------------------------

FROM node:latest as data_ranking
ENV PYTHONPATH "${PYTHONPATH}:/app"

WORKDIR /app

# get files from previous stage
COPY --from=pre_data_ranking /app/crawler_output/intermediate_files/json/ /app/

COPY ["./data_manipulation/", "/app/"]

RUN npm install

RUN node script_artworks_rank.js && \
    node script_genres_rank.js && \
    node script_artist_rank.js && \
    node script_locations_rank.js && \
    node script_materials_rank.js && \
    node script_movements_rank.js && \
    node script_motifs_rank.js && \
    node merge_art_data.js

# ------------------------------------------------

FROM python:3 as post_data_ranking
ENV PYTHONPATH "${PYTHONPATH}:/app"

WORKDIR /app

# copy necessary files
COPY --from=data_ranking /app/art_ontology.json/ /app/crawler_output/

COPY ["./data_manipulation/", "/app/data_manipulation/"]
COPY --from=Wikicrawler /app/shared/ /app/shared/

COPY ["./upload_to_elasticsearch/", "/app/upload_to_elasticsearch/"]

RUN pip install elasticsearch requests simplejson ijson

RUN ["python", "data_manipulation/add_youtube_videos.py", "-d"]
RUN ["python", "data_manipulation/split_languages.py", "-d"]

# art_ontology.json is moved to /root because elasticsearch_helper.py
# expects the json file in the home directory
COPY ["./crawler_output/", "/root/crawler_output/"]

# ------------------------------------------------

FROM docker.elastic.co/elasticsearch/elasticsearch:7.4.2
ENV PYTHONPATH "${PYTHONPATH}:/app"

WORKDIR /app

RUN yum update -y && \
    yum install -y https://repo.ius.io/ius-release-el7.rpm && \
    yum install -y python36u python36u-pip

RUN python3 --version

RUN pip3 install elasticsearch ijson requests

RUN mkdir /var/log/elasticsearch && \
    mkdir /var/lib/elasticsearch && \
    chown elasticsearch:elasticsearch /var/log/elasticsearch && \
    chown elasticsearch:elasticsearch /var/lib/elasticsearch

# copy elasticsearch config from repo into docker container
COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/

#copy other necessary files
COPY --from=post_data_ranking /app/crawler_output/ /app/crawler_output/
COPY ["./shared/", "/app/shared"]
COPY ["./upload_to_elasticsearch/", "/app/upload_to_elasticsearch/"]

RUN ls -lah /app
RUN ls -lah /app/upload_to_elasticsearch
