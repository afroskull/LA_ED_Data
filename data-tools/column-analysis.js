#!/usr/local/bin/node
var fs = require('fs');

/**
*
* This tool list out individual column names for a set of cleaned files. Use this 
* to determine how to standardize the column names. 
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

if (process.argv.length < 3) {
	// no files specified
	console.log("column-analysis: no input file.");
} else {
	var theColumns = [];

	for (var fileIndex = 2; fileIndex < process.argv.length; fileIndex ++) {
		
		var file_data = fs.readFileSync(basedir + 'data/' + process.argv[fileIndex]);
		var file_contents = file_data.toString();

		var data = file_contents.split('\n');
		data = data.map(function(row) {
			return row.split(',');
		});

		var fileCols = data[0];

		for (var i = 0; i < fileCols.length; i++) {
			if (theColumns.findIndex(function(elem) {
				return elem === fileCols[i];
			}) === -1)
				theColumns.push(fileCols[i]);
		}
	}

	console.log('columns:')
	console.log(theColumns)
}