all: atlanta boston chicago dallas dc_metro denver houston miami mpls nyc philadelphia seattle sf

atlanta:
	mapshaper shapefiles/raw/13/cb_2018_13_tract_500k.shp \
	-filter '"013,015,035,045,057,063,067,077,085,089,097,113,117,121,135,143,149,151,159,171,199,211,217,223,227,231,247,255,297".indexOf(COUNTYFP) > -1' \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/atlanta.json
boston:
	mapshaper shapefiles/raw/25/cb_2018_25_tract_500k.shp shapefiles/raw/33/cb_2018_33_tract_500k.shp combine-files \
	-filter target=1 '"009,017,021,023,025".indexOf(COUNTYFP) > -1' \
	-filter target=2 '"015,017".indexOf(COUNTYFP) > -1' \
	-merge-layers target=* \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/boston.json
chicago:
	mapshaper shapefiles/raw/17/cb_2018_17_tract_500k.shp shapefiles/raw/18/cb_2018_18_tract_500k.shp shapefiles/raw/55/cb_2018_55_tract_500k.shp combine-files \
	-filter target=1 '"031,037,043,063,089,093,097,111,197".indexOf(COUNTYFP) > -1' \
	-filter target=2 '"073,089,111,127".indexOf(COUNTYFP) > -1' \
	-filter target=3 '"059".indexOf(COUNTYFP) > -1' \
	-merge-layers target=* \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/chicago.json
dallas:
	mapshaper shapefiles/raw/48/cb_2018_48_tract_500k.shp \
	-filter '"085,113,121,139,221,231,251,257,367,397,425,439,497".indexOf(COUNTYFP) > -1' \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/dallas.json
dc_metro:
	mapshaper shapefiles/raw/11/cb_2018_11_tract_500k.shp shapefiles/raw/24/cb_2018_24_tract_500k.shp shapefiles/raw/51/cb_2018_51_tract_500k.shp shapefiles/raw/54/cb_2018_54_tract_500k.shp combine-files \
	-filter target=1 '"001".indexOf(COUNTYFP) > -1' \
	-filter target=2 '"009,017,021,031,033".indexOf(COUNTYFP) > -1' \
	-filter target=3 '"013,043,047,059,061,107,153,157,177,179,187,510,600,610,630,683,685".indexOf(COUNTYFP) > -1' \
	-filter target=4 '"037".indexOf(COUNTYFP) > -1' \
	-merge-layers target=* \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/dc_metro.json
denver:
	mapshaper shapefiles/raw/08/cb_2018_08_tract_500k.shp \
	-filter '"001,005,014,019,031,035,039,047,059,093".indexOf(COUNTYFP) > -1' \
	-simplify 100% \
	-o format=topojson public/data/tracts/denver.json
houston:
	mapshaper shapefiles/raw/48/cb_2018_48_tract_500k.shp \
	-filter '"015,039,071,157,167,201,291,339,473".indexOf(COUNTYFP) > -1' \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/houston.json
miami:
	mapshaper shapefiles/raw/12/cb_2018_12_tract_500k.shp \
	-filter '"011,086,099".indexOf(COUNTYFP) > -1' \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/miami.json
mpls:
	mapshaper shapefiles/raw/27/cb_2018_27_tract_500k.shp shapefiles/raw/55/cb_2018_55_tract_500k.shp combine-files \
	-filter target=1 '"003,019,025,037,053,059,079,095,123,139,141,143,163,171".indexOf(COUNTYFP) > -1' \
	-filter target=2 '"093,109".indexOf(COUNTYFP) > -1' \
	-merge-layers target=* \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/mpls.json
nyc:
	mapshaper shapefiles/raw/34/cb_2018_34_tract_500k.shp shapefiles/raw/36/cb_2018_36_tract_500k.shp shapefiles/raw/42/cb_2018_42_tract_500k.shp combine-files \
	-filter target=1 '"003,013,017,019,023,025,027,029,031,035,037,039".indexOf(COUNTYFP) > -1' \
	-filter target=2 '"005,027,047,059,061,071,079,081,085,087,103,119".indexOf(COUNTYFP) > -1' \
	-filter target=3 '"103".indexOf(COUNTYFP) > -1' \
	-merge-layers target=* \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/nyc.json
philadelphia:
	mapshaper shapefiles/raw/10/cb_2018_10_tract_500k.shp shapefiles/raw/24/cb_2018_24_tract_500k.shp shapefiles/raw/34/cb_2018_34_tract_500k.shp shapefiles/raw/42/cb_2018_42_tract_500k.shp combine-files \
	-filter target=1 '"003".indexOf(COUNTYFP) > -1' \
	-filter target=2 '"015".indexOf(COUNTYFP) > -1' \
	-filter target=3 '"005,007,015,033".indexOf(COUNTYFP) > -1' \
	-filter target=4 '"017,029,045,091,101".indexOf(COUNTYFP) > -1' \
	-merge-layers target=* \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/philadelphia.json
seattle:
	mapshaper shapefiles/raw/53/cb_2018_53_tract_500k.shp \
	-filter '"033,053,061".indexOf(COUNTYFP) > -1' \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/seattle.json
sf:
	mapshaper shapefiles/raw/06/cb_2018_06_tract_500k.shp \
	-filter '"001,013,041,075,081".indexOf(COUNTYFP) > -1' \
	-simplify 100% \
	-filter-fields GEOID \
	-o format=topojson public/data/tracts/sf.json


