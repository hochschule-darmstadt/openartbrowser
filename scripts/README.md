## Requirements

The scripts which extract data from wikidata for the openartbrowser are using the programming languages Python and JavaScript.
To execute them following programs are required:
- Python3 version >3.7 available at https://www.python.org/downloads/
  - > sudo apt-get install python3
- Python3 package manager pip3
  - > sudo apt-get install pip3
- Node.js >12.13.0 available at https://nodejs.org/


Installation on ubuntu (with apt):
- First add Personal Package Archives (PPA) for nodejs with curl
  - > sudo apt-get install curl
  - > curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
- Install nodejs with apt-get
  - > sudo apt-get install nodejs


The versions are recommandations older versions may work.

In order to install the dependencies of python and node.js run the install_etl.sh script.

## Execution
Be sure to use the [run_etl.sh](https://github.com/hochschule-darmstadt/openartbrowser/wiki/System-architecture#run_etlsh) script if you want to execute the whole etl process. Otherwise please check out the wiki sections (link below) and the readme's in this repository.
* [Wiki ETL scripts](https://github.com/hochschule-darmstadt/openartbrowser/wiki/System-architecture#etl-scripts)

If you want to update the production server use the [update_elasticsearch_production_from_staging.sh](https://github.com/hochschule-darmstadt/openartbrowser/wiki/System-architecture#update_elasticsearch_production_from_stagingsh) script. This is described in the wiki.

## Structure
Folders and scripts are structured by their ETL task.

|Folder|Task|
|---|---|
|data_extraction|Everything related to the extraction of art data|
|data_manipulation|Data transformations after the extraction|
|upload_to_elasticsearch|Upload the extracted and transformed data to an ElasticSearch server|
|crawler_ouput|Final and intermediate files which are generated and used by the scripts|

## Output

All output is extracted to the folder crawler_output.
The structure of this folder is following:
* crawler_output/
  * intermediate_steps/
    * csv/
      * artworks/
    * json/
      * artworks/
  * art_ontology.json
  * art_ontology_**languagecode**.json <- for each language code in the languageconfig.csv one file named in this pattern
  * art_ontology.ttl

The important files are in the "root" folder named crawler_output.
Everything else is in the intermediate_steps folder and subfolders.
