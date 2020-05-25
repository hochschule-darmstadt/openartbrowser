## Requirements

To install the required python packages for the crawler script use following command in the scripts directory:

> pip3 install .

This will install amongst other things pywikibot and requests (see setup.py)

## Execution

To see what's important to execute the script check out [pywikibot configuration](https://github.com/hochschule-darmstadt/openartbrowser/wiki/Developer-guide#pywikibot-configuration).

Be sure to execute the script from the scripts directory because it contains the user-config.py which is used by the pywikibot framework in order to start.

To execute the complete data extraction:

> python3 data_extraction/art_ontology_crawler.py

With the -d Flag you can specify that the script extracts less artworks. Usage:

> python3 data_extraction/art_ontology_crawler.py -d 5

If you want a specific file to be extracted take a look inside the extract_art_ontology() function.

Further information can be found [here](https://github.com/hochschule-darmstadt/openartbrowser/wiki/System-architecture#data-extraction)
