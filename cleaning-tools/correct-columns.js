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

if (process.argv.length !== 3) {
	// no files specified
	console.log("correct-columns: no input file.");
} else {
	var file_data = fs.readFileSync(basedir + 'eoc-data/' + process.argv[2]);
	var file_contents = file_data.toString();

	// correct headers
	file_contents = file_contents.replace('Good,', 'Good %,');
	file_contents = file_contents.replace('Fair,', 'Fair %,');
	file_contents = file_contents.replace('Total ,', 'Total #,');
	file_contents = file_contents.replace('Fair ,', 'Fair %,');
	file_contents = file_contents.replace('Fair  %,', 'Fair %,');
	file_contents = file_contents.replace('Total  #,', 'Total #,');
	file_contents = file_contents.replace('Total ,', 'Total #,');
	file_contents = file_contents.replace('Total Elementary & Secondary Enrollment ,', 'Enrollment #,');
	file_contents = file_contents.replace('Number of Students,', 'Enrollment #,');
	file_contents = file_contents.replace('Site Code ,', 'Site Code,');
	file_contents = file_contents.replace('School Name ,', 'School Name,');
	file_contents = file_contents.replace('School Name ,', 'School Name,');
	file_contents = file_contents.replace('Excellent,', 'Excellent %,');
	file_contents = file_contents.replace('Needs Improvement,', 'Needs Improvement %,');

	file_contents = file_contents.replace('Good\n', 'Good %\n');
	file_contents = file_contents.replace('Fair\n', 'Fair %\n');
	file_contents = file_contents.replace('Total \n', 'Total #\n');
	file_contents = file_contents.replace('Fair \n', 'Fair %\n');
	file_contents = file_contents.replace('Fair  %\n', 'Fair %\n');
	file_contents = file_contents.replace('Total  #\n', 'Total #\n');
	file_contents = file_contents.replace('Total \n', 'Total #\n');
	file_contents = file_contents.replace('Total Elementary & Secondary Enrollment \n', 'Enrollemnt #\n');
	file_contents = file_contents.replace('Number of Students\n', 'Entrollment #\n');
	file_contents = file_contents.replace('Site Code \n', 'Site Code\n');
	file_contents = file_contents.replace('School Name \n', 'School Name\n');
	file_contents = file_contents.replace('School Name \n', 'School Name\n');
	file_contents = file_contents.replace('Excellent\n', 'Excellent %\n');
	file_contents = file_contents.replace('Needs Improvement\n', 'Needs Improvement %\n');

	// remove all non-ascii characters
	file_contents = file_contents.replace(/[^\x00-\x7F]/g, "");
	file_contents = file_contents.replace(/\=\>/g, '');
	file_contents = file_contents.replace(/\>\=/g, '');
	file_contents = file_contents.replace(/\<\=/g, '');
	file_contents = file_contents.replace(/\=\</g, '');
	file_contents = file_contents.replace(/\</g, '');
	file_contents = file_contents.replace(/\>/g, '');

	// correct site codes
	var data = file_contents.split('\n').map(function(row) {
		return row.split(',');
	});

	// this file is stupid
	if (process.argv[2] === 'algebra-i-annual-report-december-2007-may-2008.clean.csv') {
		data[0] = ['Site Code', 'School Name', 'Total #', 'Excellent #', 'Excellent %',
			'Good #', 'Good %', 'Fair #', 'Fair %', 'Needs Improvement #', 'Needs Improvement %'];
	}

	var scci = data[0].findIndex(function(elem) { return 'Site Code' === elem; });
	for (var i = 1; i < data.length && scci != -1; i++) {
		if (data[i][scci].match(/^[+-]?(\d*\.)?\d+$/) === null) continue;
		while (data[i][scci].length < 3)
			data[i][scci] = '0' + data[i][scci];

		while (data[i][scci].length < 6 && data[i][scci].length >= 4)
			data[i][scci] = '0' + data[i][scci];
	}

	file_contents = data.map(function(row) { return row.join(','); }).join('\n');

	// form voltron
	var new_file_name = basedir + 'eoc-data/' + process.argv[2];

	fs.writeFileSync(new_file_name, file_contents); 
}