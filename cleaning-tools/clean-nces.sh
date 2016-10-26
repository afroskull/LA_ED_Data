#!/bin/bash

# get the base directory
BASEDIR=`pwd`
while [ ! "$(basename "${BASEDIR}")" == "LA_ED_Data" ]
do
	BASEDIR=$(dirname "${BASEDIR}")
done

for file in $BASEDIR/nces-raw/*.txt
do
	$BASEDIR/cleaning-tools/nces-filter-louisiana.js $(basename "$file")
	echo "clean-nces: filtered $file"
done
