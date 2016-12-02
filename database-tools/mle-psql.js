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

var get_subject = function(fname) {
	if (fname.indexOf('algebra-i-') !== -1) return 'Algebra I';
	if (fname.indexOf('biology-') !== -1) return 'Biology';
	if (fname.indexOf('english-ii-') !== -1) return 'English II';
	if (fname.indexOf('english-iii-') !== -1) return 'English III';
	if (fname.indexOf('geometry-') !== -1) return 'Geometry';
	if (fname.indexOf('u-s-history-') !== -1) return 'U. S. History';
	return null;
};

var get_year = function(fname) {
	if (fname.indexOf('2007') !== -1 && fname.indexOf('2008') !== -1) return '2007';
	if (fname.indexOf('2008') !== -1 && fname.indexOf('2009') !== -1) return '2008';
	if (fname.indexOf('2009') !== -1 && fname.indexOf('2010') !== -1) return '2009';
	if (fname.indexOf('2010') !== -1 && fname.indexOf('2011') !== -1) return '2010';
	if (fname.indexOf('2011') !== -1 && fname.indexOf('2012') !== -1) return '2011';
	if (fname.indexOf('2012') !== -1 && fname.indexOf('2013') !== -1) return '2012';
	if (fname.indexOf('2013') !== -1 && fname.indexOf('2014') !== -1) return '2013';
	if (fname.indexOf('2014') !== -1 && fname.indexOf('2015') !== -1) return '2014';
	if (fname.indexOf('2015') !== -1 && fname.indexOf('2016') !== -1) return '2015';
	return null;
};

var is_eq = function(x) {
	return function(elem) {
		return elem === x;
	}
};

var basedir = process.cwd();
basedir = basedir.substring(0, basedir.indexOf('LA_ED_Data') + 'LA_ED_Data'.length) + '/';

if (process.argv.length != 3) {
	// no file specified
	console.log("mle-psql: no input file.");
} else {
	client.connect();

	var year = get_year(process.argv[2]);
	var subject = get_subject(process.argv[2]);
	
	// open the file

	var contents = fs.readFileSync(basedir + 'mle-data/' + process.argv[2]);

	var data = contents.toString().split('\n').map(function(row) {
		return row.split(',');
	});

	var completed = { value: 0, max_value: data.length - 1 };
	for (var i = 1; i < data.length; i++) {
		var dataline = [];
		dataline.push(subject);
		dataline.push(data[i][data[0].findIndex(is_eq('Site Code'))]);
		if (dataline[1] == 'State Summary')
			dataline[1] = 'State';
		dataline.push(year);
		dataline.push(data[i][data[0].findIndex(is_eq('mean (MLE)'))]);
		dataline.push(data[i][data[0].findIndex(is_eq('st. dev. (MLE)'))]);
		for (var j = 0; j < dataline.length; j++) {
			if (dataline[j] == 'NA')
				dataline[j] = null;
		}
		console.log(dataline);
		var query = client.query('INSERT INTO ons (subject, site_code, year, mean_mle, std_dev_mle) VALUES ($1, $2, $3, $4, $5)', 
				dataline, (function(data) {
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

