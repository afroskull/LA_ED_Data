#!/usr/local/bin/node
var fs = require('fs');

/**
*
* I want to make database entries foe EOC scores (and every other score set that we have)
* using (Site Code, School Name) as the primary key for the database. This is a tool to 
* analyze the cleaned CSV files to see if there are schools that do not match this criteria. 
*
*/

// findIndex polyfill
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}

var basedir = process.cwd();
basedir = basedir.substring(0, basedir.indexOf('LA_ED_Data') + 'LA_ED_Data'.length) + '/';

// empty array to store [code, name, instances] primary keys
var primaryKeys = [];

if (process.argv.length < 3) {
	// no files specified
	console.log("primary-key-analysis: no input file.");
} else {
	var target_key = 0;
	for (var fileIndex = 2; fileIndex < process.argv.length; fileIndex++) {
		target_key ++;
		var file_data = fs.readFileSync(basedir + 'data/' + process.argv[fileIndex]);

		var file_contents = file_data.toString();
		var data = file_contents.split('\n');
		data = data.map(function(row) {
			return row.split(',');
		});

		// assume first two columns are site code and school name
		for (var rowIndex = 0; rowIndex < data.length; rowIndex++) {
			var key = [ 
				data[rowIndex][0], 
				data[rowIndex][1] 
			];

			var keyIndex = primaryKeys.findIndex(function(pKey) {
				return (pKey[0] === key[0] && pKey[1] === key[1]);
			}, key);

			if (keyIndex === -1) {
				// add a new primary key
				primaryKeys.push([key[0], key[1], 1]);
			} else {
				primaryKeys[keyIndex][2] ++;
			}
		}
	}

	var inappropriate_data = primaryKeys.filter(function(elem) {
		return elem === target_key;
	});

	/*
	console.log('primary key analysis: ');
	for (var i = 0; i < primaryKeys.length; i++) {
		console.log("Site Code: " + primaryKeys[i][0] + "\tSchool: " + primaryKeys[i][1] + "\tFound in: " + primaryKeys[i][2] + (primaryKeys[i][2] !== target_key ? '\tBAD KEY' : '\tGOOD KEY'));
	}*/
	console.log('Number of bad keys: ' + inappropriate_data.length);
	console.log(inappropriate_data);
}