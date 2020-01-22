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

# ------------------------------------------------

FROM node:latest as data_ranking

WORKDIR /app

# get files from previous stage
COPY --from=Wikicrawler /app/crawler_output/intermediate_files/json/ /app/

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

COPY ["./upload_to_elasticsearch/", "/app/upload_to_elasticsearch/"]

RUN ls -lah /app/
RUN ls -lah /app/crawler_output/

RUN pip install elasticsearch requests simplejson ijson

RUN ["python", "data_manipulation/add_youtube_videos.py", "-d"]
RUN ["python", "data_manipulation/split_languages.py", "-d"]

# art_ontology.json is moved to /root because elasticsearch_helper.py expects the json file in the
# home directory
COPY ["./crawler_output/", "/root/crawler_output/"]

RUN tar cfvz crawler_output.tar.gz crawler_output/

RUN ls -lah

#Copy tar to www/html dir after elasticsearch is set up

# -----------------------------------------

FROM docker.elastic.co/elasticsearch/elasticsearch:7.4.2

WORKDIR /app

RUN yum update -y && \
    yum install -y https://centos7.iuscommunity.org/ius-release.rpm && \
    yum install -y python36u python36u-pip
	
RUN python --version

RUN pip3 install elasticsearch ijson requests

RUN mkdir /var/log/elasticsearch && \
    mkdir /var/lib/elasticsearch && \
    chown elasticsearch:elasticsearch /var/log/elasticsearch && \
    chown elasticsearch:elasticsearch /var/lib/elasticsearch

# copy elasticsearch config from repo into docker container
COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/

COPY ["./upload_to_elasticsearch/", "/app"]

#move tar.gz to created html dir
COPY --from=post_data_ranking /app/crawler_output.tar.gz /var/www/html/
RUN ls -lah /var/www/html