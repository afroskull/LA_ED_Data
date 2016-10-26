#!/usr/local/bin/node
var fs = require('fs');

// select valid nces file for year
var compute_nces_file = function(fname) {
	var year = fname.match(/\d+/)[0];
	return 'nces' + year + '.csv';
}

/**
*
* Takes NCES data and filters out only louisiana schools and the right columns for them
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

if (process.argv.length != 3) {
	// no file specified
	console.log("nces-id-inject: no input file.");
} else {
	// open the file

	var file_contents = fs.readFileSync(basedir + 'eoc-data/' + process.argv[2]).toString();
	var nces_contents = fs.readFileSync(basedir + 'nces-data/' + compute_nces_file(process.argv[2])).toString();

	var data = file_contents.split('\n').map(function(row) {
		return row.split(',');
	});

	var ncesData = nces_contents.split('\n').map(function(row) {
		return row.split(',');
	});

	// vertical pivot
	var ncesData = ncesData[0].map(function(col, i) { 
		return ncesData.map(function(row) { 
			return row[i] 
		})
	});

	// now we have ncesData[0] = NCES id, ncesData[1] = Site Code, ncesData[2] = School Name
	data[0].unshift('NCES ID');
	for (var i = 1; i < data.length; i++) {
		var schoolCode = data[i][0];
		var ncesIDIndex = ncesData[1].findIndex(function(elem) {
			return elem === schoolCode;
		});
		if (ncesIDIndex === -1) {
			console.log('not found: ' + data[i]);
			data[i].unshift('NA')
		} else {
			var ncesCode = ncesData[0][ncesIDIndex];
			data[i].unshift(ncesCode);
		}
	}

	var new_contents = data.map(function(row) {
		return row.join(',');
	}).join('\n');

	fs.writeFileSync(basedir + 'eoc-data/' + process.argv[2], new_contents); 
}
