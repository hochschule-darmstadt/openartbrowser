from os import environ, getenv

if getenv("PYWIKIBOT_NO_USER_CONFIG") != "1":
    environ["PYWIKIBOT_NO_USER_CONFIG"] = "1"

from ArtOntologyCrawler import extract_art_ontology

extract_art_ontology()
