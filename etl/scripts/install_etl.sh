#!/bin/sh
echo "export PYTHONPATH="${PYTHONPATH}:${pwd}"" >> ~/.bashrc # Add directory to PYTHONPATH, this enables imports in python3
echo "export PYWIKIBOT_DIR="${pwd}"" >> ~/.bashrc # Add directory to PYWIKIBOT_DIR, this enables execution of data_extraction scripts in any directory
cd data_manipulation
npm install
