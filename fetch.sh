#!/bin/bash


curl --create-dir 'https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_{06,08,09,10,11,12,13,17,18,22,24,25,27,33,34,36,40,42,48,51,53,54,55}_tract_500k.zip' -o 'shapefiles/raw/#1.zip'
for i in shapefiles/raw/*.zip; do unzip -o -d "${i%*.zip}" "$i"; done


