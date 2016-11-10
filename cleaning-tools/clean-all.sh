#!/bin/bash

# get the base directory
BASEDIR=`pwd`
while [ ! "$(basename "${BASEDIR}")" == "LA_ED_Data" ]
do
	BASEDIR=$(dirname "${BASEDIR}")
done

$BASEDIR/cleaning-tools/clean-nces.sh

for file in $BASEDIR/raw-data/*.xlsx
do
	$BASEDIR/cleaning-tools/clean.sh $(basename "$file")
	echo "clean-all: cleaned $file"
done
