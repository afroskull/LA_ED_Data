#!/usr/local/bin/node
var fs = require('fs');
var pg = require('pg');

var client = new pg.Client({
  user: 'postgres', //env var: PGUSER
  database: 'labelieves', //env var: PGDATABASE
  password: 'HIDDEN',
  host: '138.197.18.31', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
});

/**
*
* Inserts NCES files into school table in postgres
*
*/

var basedir = process.cwd();
basedir = basedir.substring(0, basedir.indexOf('LA_ED_Data') + 'LA_ED_Data'.length) + '/';

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

if (process.argv.length != 3) {
	// no file specified
	console.log("nces-psql: no input file.");
} else {
	client.connect();

	var year = Number(process.argv[2].substring(4, 8));
	
	// open the file

	var nces_contents = fs.readFileSync(basedir + 'nces-data/' + process.argv[2]);

	var ncesData = nces_contents.toString().split('\n').map(function(row) {
		return row.split(',');
	});

	var completed = { value: 0, max_value: ncesData.length - 1 };
	for (var i = 1; i < ncesData.length; i++) {
		ncesData[i].push(year);
		for (var j = 0; j < ncesData[i].length; j++) 
			if (ncesData[i][j] == 'NA')
				ncesData[i][j] = null;
		var query = client.query('INSERT INTO school (subject, nces_id, site_code, year, excellent, good, fair, needs_improvement) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', 
				ncesData[i], (function(data) {
			return function(err, result) {
				data.value = data.value + 1;
				if (err) console.log(err);
				console.log(data.value + ' of ' + data.max_value);
				if (data.value >= data.max_value) client.end();
			};
		})(completed));
	} 
}

//client.end();

