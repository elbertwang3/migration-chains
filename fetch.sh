#!/bin/bash


curl --create-dir 'https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_{06,08,11,12,13,17,25,27,36,42,48,53}_tract_500k.zip' -o 'shapefiles/raw/#1.zip'
for i in shapefiles/raw/*.zip; do unzip -o -d "${i%*.zip}" "$i"; done


