## Requirements

To install the required python packages for the data extraction script use following command in the etl directory:

> pip3 install -r requirements.txt

This will install amongst other things pywikibot and requests.

## Execution

To see what's important to execute the script check out [pywikibot configuration](https://github.com/hochschule-darmstadt/openartbrowser/wiki/Installation-Guide#pywikibot-configuration).

Be sure to execute the script from the etl directory because it contains the user-config.py which is used by the pywikibot framework in order to start.

The install_etl.sh script will set an environment variable which enables to execute the script from any directory. However this is not recommended if you want to run the full process.

To execute the complete data extraction:

> python3 data_extraction/get_wikidata_items.py
> python3 data_extraction/get_wikipedia_extracts.py

With the -d Flag you can specify that the script extracts less artworks. The number behind d is the number of chunks to load. A chunk has 50 items. Following command will extract 5*50 = 250 items from each artwork category (painting, sculputure and drawing):

> python3 data_extraction/get_wikidata_items.py -d 5

If you want a specific file to be extracted take a look inside the extract_art_ontology() function.

Further information can be found [here](https://github.com/hochschule-darmstadt/openartbrowser/wiki/System-architecture#data-extraction)
