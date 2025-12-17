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

The versions are recommendations older versions may work.

In order to install the dependencies of python and node.js run the install_etl.sh script.

## Set environment variables for importing python modules
The python scripts reference own modules to avoid code duplication.
It is necessary to set environment variables that this procedure works.
On Unix based systems the PYTHONPATH variable has to be set to the openartbrowser/etl directory on your opened shell session.
> export PYTHONPATH="${PYTHONPATH}:openartbrowser/etl"

The Unix environment variables are dependend on the shell you use so you have to look that up if the above doesn't work for you.
In the openartbrowser/etl/scripts/install_etl.sh are examples on how to set the environment variable up for the bash shell.

You may also set the PYWIKIBOT_DIR variable to the openartbrowser/etl directory to be able to execute the script
from another directory than openartbrowser/etl, but this is optional and not used on the server anyways.

On Windows the system environment variable (not user variable) can be set via the GUI or via the terminal like this
> setx PYTHONPATH "%PYTHONPATH%;%CD%" /M

Also the PYWIKIBOT_DIR variable can be set but this is optional.
> setx PYWIKIBOT_DIR "%CD%" /M

If above doesn't work for you please use the GUI for it.

## Execution

Be sure to use the [run_etl.sh](https://github.com/hochschule-darmstadt/openartbrowser/wiki/System-architecture#run_etlsh) script if you want to execute the whole etl process. Otherwise please check out the wiki sections (link below) and the readme's in this repository.

- [Wiki ETL scripts](https://github.com/hochschule-darmstadt/openartbrowser/wiki/System-architecture#etl-scripts)

If you want to update the production server use the [update_elasticsearch_production_from_staging.sh](https://github.com/hochschule-darmstadt/openartbrowser/wiki/System-architecture#update_elasticsearch_production_from_stagingsh) script. This is described in the wiki.

## Structure

Folders and scripts are structured by their ETL task.

| Folder                  | Task                                                                     |
| ----------------------- | ------------------------------------------------------------------------ |
| data_extraction         | Everything related to the extraction of art data                         |
| data_enhancement       | Data enhancements after the extraction                                |
| upload_to_elasticsearch | Upload the extracted and transformed data to an ElasticSearch server     |
| generate_rdf            | Everything related to generating a rdf file (turtle format .ttl) from the crawler_output's art_ontology_en.json |
| scripts | Bash (Unix) and Batch (Windows) scripts to execute the full ETL process + scripts for usage on our staging and production server. :warning: These scripts should all be executed from the parent directory (etl) otherwise they won't work e. g. `./scripts/run_etl.sh`|
| shared | Shared python functions as module for the python scripts |
| crawler_ouput (generated on execution)| Final and intermediate files which are generated and used by the python scripts |
| logs (generated on execution) | Different log files are saved here |
| tokens (user defined) | location to store tokens e. g. the slack token to write to a slack channel. Necessary on for the execution of the bash scripts |

## Output

All output is extracted to the folder crawler_output.
The structure of this folder is following:

- crawler_output/
  - intermediate_steps/
    - csv/
      - artworks/
    - json/
      - artworks/
  - art_ontology.json
  - art_ontology_**languagecode**.json <- for each language code in the languageconfig.csv one file named in this pattern
  - art_ontology_en.ttl <- this file is only available if the generate_rdf.py script was executed, this does not happen within the run_etl.sh script because generate_rdf.py is an optional step

The important files are in the "root" folder named crawler_output.
Everything else is in the intermediate_steps folder and subfolders.
