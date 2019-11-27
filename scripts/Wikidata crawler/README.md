## Requirements

To install the required python packages for the crawler script use following command in this directory:
> pip3 install -r requirements.txt

This will install pywikibot and requests (see requirements.txt)

## Execution

Before starting the extraction you need to configure your pywikibot installation. See the wiki section for this [pywikibot configuration](https://github.com/hochschule-darmstadt/openartbrowser/wiki/Developer-guide#pywikibot-configuration).

To execute the complete data extraction:
> python3 -c "import ArtOntologyCrawler; ArtOntologyCrawler.extract_art_ontology()"

If you want a specific file to be extracted take a look inside the extract_art_ontology() function. This is the place where all files are generated.