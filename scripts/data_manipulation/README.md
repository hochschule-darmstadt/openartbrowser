## Requirements

To install the required node.js packages for the ranking scripts use following command in this directory:
> npm install

This will install every need dependency (see package.json)

## Execution

First execute the script_artworks_rank.js script

1. > node ../data_manipulation/script_artworks.js
2. > node ../data_manipulation/script_artworks_rank.js

The execution order of the other ranking script doesn't matter

> node ../data_manipulation/script_genres_rank.js

> node ../data_manipulation/script_artist_rank.js 

> node ../data_manipulation/script_locations_rank.js

> node ../data_manipulation/script_materials_rank.js 

> node ../data_manipulation/script_movements_rank.js 

> node ../data_manipulation/script_objects_rank.js 

The last step is merging all files into one:

> node ../data_manipulation/script_flatten_rank.js

All intermediate files (*.json) have to be located in ToDo. Otherwise there will be errors.