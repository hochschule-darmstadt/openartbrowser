# openartbrowser

# Table of contents

- [Overview](#overview)
- [Frontend](#frontend)

## Overview

openArtBrowser <http://openartbrowser.org> invites you to browse through the world of arts, enjoy beautiful artworks and learn interesting things. We provide paintings, drawings and sculptures all over the world and from many periods.

This project contains:

- Scripts to crawl relevant data about artworks, artists, genres, locations, materials, motifs and movements from Wikidata

- Scripts to preprocess the crawled data

- Angular frontent

## Frontend

To start the frontend:

- download and install Node.js.
- open a terminal and install Angular CLI globally: `npm install -g @angular/cli`

- for development mode: `ng serve` from artbrowser/app folder, app will be available in a browser on localhost:4200

- for deployment: `ng build --prod` on server and copy files to target directory

Frontend configuration:

- default elasticSearch url is 'http://openartbrowser.org/api/_search'

- To change elasticSearch url to another server, change the above url in ‚app/src/app/core/services/data.service.ts‘
