FROM python:3 as Wikicrawler

WORKDIR /app

RUN pip install pywikibot

#copy necessary files
COPY ["./data_extraction/", "/app/data_extraction"]
COPY ["./user-config.py", "/app"]
COPY ["./languageconfig.csv/", "/app"]
COPY ["./language_helper.py/", "/app"]
# run ArtOntologyCrawler in development mode
RUN ["python", "/app/data_extraction/art_ontology_crawler.py", "-d"]
RUN ls -lah /app/
# move all files needed by the next stage into output_data
#RUN mkdir /app/output_data && mv *.json /app/crawler_output/intermediate_files/json/ && mv *.csv /app/crawler_output/intermediate_files/csv/

# ------------------------------------------------

FROM node:latest as data_ranking

WORKDIR /app
# get files from previous stage
COPY --from=Wikicrawler /app/crawler_output/intermediate_files/json/ /app/
#COPY --from=Wikicrawler /app/crawler_output/intermediate_files/csv/ /app/

COPY ["./data_manipulation/", "/app/"]

RUN npm install

RUN ls -lah /app/

RUN node script_artworks_rank.js && \
    node script_genres_rank.js && \
    node script_artist_rank.js && \
    node script_locations_rank.js && \
    node script_materials_rank.js && \
    node script_movements_rank.js && \
    node script_motifs_rank.js && \
    node merge_art_data.js

RUN ls -lah /app/
# -----------------------------------------

FROM python:3 as post_data_ranking

WORKDIR /app

# copy necessary files
COPY --from=data_ranking /app/art_ontology.json/ /app/crawler_output/

COPY ["./data_manipulation/", "/app/data_manipulation/"]
COPY --from=Wikicrawler /app/languageconfig.csv/ /app/
COPY --from=Wikicrawler /app/language_helper.py/ /app/
#COPY --from=data_ranking /app/split_languages.py/ /app/data_manipulation/
#COPY --from=data_ranking /app/add_youtube_videos.py/ /app/data_manipulation/
#COPY --from=data_ranking /app/youtube_videos.csv/ /app/data_manipulation/

COPY ["./upload_to_elasticsearch/", "/app/upload_to_elasticsearch/"]

RUN ls -lah /app/
RUN ls -lah /app/crawler_output/

RUN pip install elasticsearch requests simplejson ijson

RUN ["python", "data_manipulation/add_youtube_videos.py", "-d"]
RUN ["python", "data_manipulation/split_languages.py", "-d"]
RUN ["python", "upload_to_elasticsearch/elasticsearch_helper.py", "-d"]

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
COPY --from=data_ranking /app/master_flat_rank.json /root/master_flat.json

COPY ["./upload_to_elasticsearch/", "/app"]
