#!/usr/local/bin/node
var fs = require('fs');

var pivotTable = function(table) {
	var pivotedTable = table[0].map(function(col, i) { 
		return table.map(function(row) { 
			return row[i];
		});
	});
	return pivotedTable;
}

var basedir = process.cwd();
basedir = basedir.substring(0, basedir.indexOf('LA_ED_Data') + 'LA_ED_Data'.length) + '/';

if (process.argv.length != 3) {
	// no file specified
	console.log("pivot: no input file.");
} else {
	// open the file
	fs.readFile(basedir + 'eoc-data/' + process.argv[2], function(err, data) {
		if (err !== null) {
			console.log(err);
			console.log("pivot: " + err.errno + " - " + err.code);
			return;
		}
		var file_contents = data.toString();
		data = file_contents.split('\n').map(function(row) {
			return row.split(',');
		});

		var pivotedData = pivotTable(data);

		// merge data back together
		var new_contents = '\"' + pivotedData.map(function(row) {
			return row.join('\",\"');
		}).join('\"\n\"') + '\"';

		// form voltron
		var old_file_name = process.argv[2].match(/[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-]+\.csv$/)[0];
		var new_file_name = basedir + 'eoc-data-pivoted/' + old_file_name.replace(/\.csv$/, '.pivoted.csv');
		console.log(old_file_name);
		

		fs.writeFileSync(new_file_name, new_contents); 
	});
}