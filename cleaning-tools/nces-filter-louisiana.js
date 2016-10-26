#!/usr/local/bin/node
var fs = require('fs');

var col_find = [
	'FIPST', '22'
];

var keep_columns = [
	'NCESSCH',
	'SEASCH', // school id
	'SCHNAM'  // school name
];

// translate to english ;D
var keep_names = [
	'NCES Code',
	'Site Code',
	'School Name'
];

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
	console.log("nces-filter: no input file.");
} else {
	// open the file
	fs.readFile(basedir + 'nces-raw/' + process.argv[2], function(err, data) {
		if (err !== null) {
			console.log(err);
			console.log("nces-filter: " + err.errno + " - " + err.code);
			return;
		}
		var file_contents = data.toString();
		data = file_contents.split('\n').map(function(row) {
			return row.split('\t');
		});

		var index = data[0].findIndex(function(elem) {
			return elem === col_find[0];
		});

		data = data.filter(function(row, i) {
			return  (i === 0) || row[index] === col_find[1];
		});

		var dataVert = data[0].map(function(col, i) { 
			return data.map(function(row) { 
				return row[i] 
			})
		});

		// remove columns not necessary
		dataVert = dataVert.filter(function(col) {
			var flag = false;
			for (var i = 0; i < keep_columns.length && !flag; i++) {
				if (col[0].indexOf(keep_columns[i]) !== -1) {
					flag = true;
					col[0] = keep_names[i];
				}
			}
			return flag;
		});

		data = dataVert[0].map(function(col, i) { 
			return dataVert.map(function(row) { 
				return row[i] 
			})
		});

		// merge data back together
		var new_contents = data.map(function(row) {
			return row.join(',');
		}).join('\n');

		// form voltron
		var old_file_name = process.argv[2].match(/[a-zA-Z0-9\-]+\.txt$/)[0]
		var new_file_name = basedir + 'nces-data/' + old_file_name.replace(/\.txt$/, '.csv');
		

		fs.writeFileSync(new_file_name, new_contents); 
	});
}
