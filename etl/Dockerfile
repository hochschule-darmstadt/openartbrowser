FROM python:3 as Wikicrawler

WORKDIR /app
# The pythonpath is needed for package/module imports
ENV PYTHONPATH "${PYTHONPATH}:/app"

RUN pip install pywikibot ijson wikitextparser

#copy necessary files
COPY ["./data_extraction/", "/app/data_extraction"]
COPY ["./user-config.py", "/app"]
COPY ["./shared/", "/app/shared"]
RUN mkdir "/app/logs"
# run get_wikidata_items in development mode
RUN pip install SPARQLWrapper
RUN ["python", "/app/data_extraction/get_wikidata_items.py", "-d", "5"]
RUN ["python", "/app/data_extraction/get_wikipedia_extracts.py"]


# ------------------------------------------------

FROM python:3 as data_enhancement
ENV PYTHONPATH "${PYTHONPATH}:/app"

WORKDIR /app

# get files from previous stage
COPY --from=Wikicrawler /app/crawler_output/ /app/crawler_output/

RUN mkdir data_enhancement
COPY ["./data_enhancement/", "/app/data_enhancement"]
COPY ["./shared/", "/app/shared"]
RUN mkdir "/app/logs"

RUN pip install ijson requests
RUN ["python", "./data_enhancement/estimate_movement_period.py"]
RUN ["python", "./data_enhancement/has_part_part_of_enhancement.py"]
RUN ["python", "./data_enhancement/add_youtube_videos.py"]

RUN ["python", "./data_enhancement/ranking.py"]
# ------------------------------------------------

FROM stedolan/jq:latest as merge_files

WORKDIR /app

# get files from previous stage
COPY --from=data_enhancement /app/crawler_output/intermediate_files/json/ /app/

RUN jq -s "[.[][]]" artworks.json genres.json artists.json locations.json materials.json movements.json motifs.json classes.json > art_ontology.json

# ------------------------------------------------

FROM python:3 as post_data_ranking
ENV PYTHONPATH "${PYTHONPATH}:/app"

WORKDIR /app

# copy necessary files
COPY --from=merge_files /app/art_ontology.json/ /app/crawler_output/

COPY ["./data_enhancement/split_languages.py", "/app/data_enhancement/split_languages.py"]
COPY --from=Wikicrawler /app/shared/ /app/shared/

RUN pip install ijson
RUN ["python", "data_enhancement/split_languages.py"]

# art_ontology.json is moved to /root because elasticsearch_helper.py
# expects the json file in the home directory
RUN ["cp", "-r", "/app/crawler_output", "/root/crawler_output/"]

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
