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

## Structure
Folders and scripts are structured by their ETL task.

|Folder|Task|
|---|---|
|Wikidata crawler|Everything related to the extraction of art data|
|data_manipulation|Data transformations after the extraction|
|upload_to_elasticsearch|Upload the extracted and transformed data to an ElasticSearch server|
|crawler_ouput|Final and intermediate files which are generated and used by the scripts|

## Output

All output is extracted to the folder crawler_output.
The structure of this folder is following:
* crawler_output/
  * IntermediateSteps/
    * csv/
    * json/
  * ArtOntology.json
  * ArtOntology.ttl

The important files are in the "root" folder named crawler_output.
Everything else is in the IntermediateSteps folder and subfolders.
