#!/bin/bash
echo "export PYTHONPATH="${PYTHONPATH}:${pwd}"" >> ~/.bashrc # Add directory to PYTHONPATH, this enables imports in python3
echo "export PYWIKIBOT_DIR="${pwd}"" >> ~/.bashrc # Add directory to PYWIKIBOT_DIR, this enables execution of data_extraction scripts in any directory
pip3 install -r requirements.txt
