#!/usr/local/bin/node
var fs = require('fs');

/**
*
* determines years and schools where site codes change
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

function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

var basedir = process.cwd();
basedir = basedir.substring(0, basedir.indexOf('LA_ED_Data') + 'LA_ED_Data'.length) + '/';

if (process.argv.length < 3) {
	// no files specified
	console.log("nces-site-code-analysis: too few arguments.");
} else {
	var diffs = [];

	for (var fileIndex = 3; fileIndex < process.argv.length; fileIndex ++) {
		
		var file_data = fs.readFileSync(basedir + 'nces-data/' + process.argv[fileIndex]);
		var file_contents = file_data.toString();

		var data = file_contents.split('\n');
		data = data.map(function(row) {
			return row.split(',');
		});

		for (var i = 1; i < data.length; i++) {
			diffs.push(data[i]);
		}

		data.sort(function(a, b) {
			return Number(a[0]) - Number(b[0]);
		})
	}

	console.log('data in \"' + process.argv[2] + '\":')
	console.log(uniq(diffs));
	console.log('processed ' + (process.argv.length - 2) + ' files.')
}