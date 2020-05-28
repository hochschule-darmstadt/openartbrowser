#!/bin/sh
cd ..
export PYTHONPATH="${PYTHONPATH}:${pwd}" # Add directory to PYTHONPATH, this enables imports in python3
export PYWIKIBOT_DIR="${pwd}" # Add directory to PYWIKIBOT_DIR, this enables execution of data_extraction scripts in any directory
cd data_manipulation
npm install
