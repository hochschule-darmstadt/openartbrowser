
FROM python:3.14-slim AS uv_builder
COPY --from=ghcr.io/astral-sh/uv:0.8.21 /uv /uvx /bin/
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy WITH_EXTENSION=0
COPY uv.lock pyproject.toml ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --no-install-project --no-dev
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# ------------------------------------------------

FROM python:3.14-slim AS wikicrawler

COPY --from=uv_builder /app /app
ENV PATH="/app/.venv/bin:$PATH"
WORKDIR /app
#copy necessary files
COPY ["./data_extraction", "/app"]
COPY ["./user-config.py", "/app"]
COPY ["./shared/", "/app/shared"]
RUN mkdir "/app/logs"
# run get_wikidata_items in development mode
RUN ["python", "-m", "data_extraction.get_wikidata_items", "-d", "5", "-r"]
RUN ["python", "-m", "data_extraction.get_wikipedia_extracts"]


# ------------------------------------------------

FROM python:3.14-slim AS data_enhancement

COPY --from=uv_builder /app /app
ENV PATH="/app/.venv/bin:$PATH"
WORKDIR /app

# get files from previous stage
COPY --from=wikicrawler  /app/crawler_output/ /app/crawler_output/

RUN mkdir data_enhancement
COPY ["./data_enhancement/", "/app/data_enhancement"]
COPY ["./shared/", "/app/shared"]
RUN mkdir "/app/logs"

RUN ["python", "-m", "data_enhancement.estimate_movement_period"]
RUN ["python", "-m", "data_enhancement.has_part_part_of_enhancement"]
RUN ["python", "-m", "data_enhancement.add_youtube_videos"]

RUN ["python", "-m", "data_enhancement.ranking"]
# ------------------------------------------------

FROM stedolan/jq:latest AS merge_files

WORKDIR /app

# get files from previous stage
COPY --from=data_enhancement /app/crawler_output/intermediate_files/json/ /app/

RUN jq -s "[.[][]]" artworks.json genres.json artists.json locations.json materials.json movements.json motifs.json classes.json > art_ontology.json

# ------------------------------------------------

FROM python:3.14-slim AS post_data_ranking
COPY --from=uv_builder /app /app
ENV PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# copy necessary files
COPY --from=merge_files /app/art_ontology.json/ /app/crawler_output/

COPY ["./data_enhancement/split_languages.py", "/app/data_enhancement/split_languages.py"]
COPY --from=wikicrawler  /app/shared/ /app/shared/

RUN pip install ijson
RUN ["python", "-m", "data_enhancement.split_languages"]

# art_ontology.json is moved to /root because elasticsearch_helper.py
# expects the json file in the home directory
RUN ["cp", "-r", "/app/crawler_output", "/root/crawler_output/"]

# ------------------------------------------------

FROM docker.elastic.co/elasticsearch/elasticsearch:8.18.8

COPY --from=uv_builder /app /app
ENV PATH="/app/.venv/bin:$PATH"
WORKDIR /app
USER root

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
