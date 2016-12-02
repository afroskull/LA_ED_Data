#!/bin/bash

# get the base directory
BASEDIR=`pwd`
while [ ! "$(basename "${BASEDIR}")" == "LA_ED_Data" ]
do
	BASEDIR=$(dirname "${BASEDIR}")
done

if [ "$#" -ne 1 ]; then
    echo "clean: no input file."
else 
	base=`echo "$1" | awk '/\.xlsx$/ { sub(/\.xlsx$/, ""); } { print }'`

	if [ ! -d "$BASEDIR/eoc-data" ]; then
		echo 'clean: creating data directory'
		mkdir -p $BASEDIR/eoc-data
	fi
	if [ ! -d "$BASEDIR/eoc-data-pivoted" ]; then
		echo 'clean: creating pivoted data directory'
		mkdir -p $BASEDIR/eoc-data-pivoted
	fi
	if [ ! -d "$BASEDIR/raw-csv" ]; then
		echo 'clean: creating raw-csv directory'
		mkdir $BASEDIR/raw-csv
	fi
	#ssconvert $BASEDIR/raw-data/$base.xlsx $BASEDIR/raw-csv/$base.csv
	#$BASEDIR/cleaning-tools/stripper.js $base.csv
	#$BASEDIR/cleaning-tools/correct-columns.js $base.clean.csv
	#$BASEDIR/cleaning-tools/nces-id-inject.js $base.clean.csv
    #$BASEDIR/database-tools/eoc-psql.js $base.clean.csv
    $BASEDIR/database-tools/agg-psql.js $base.clean.csv
	# $BASEDIR/cleaning-tools/pivot.js $base.clean.csv
fi
