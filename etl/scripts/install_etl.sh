#!/bin/sh
cd ..
pip3 install -r requirements.txt
pip3 install . # Install own packages
cd data_manipulation
npm install
