#!/usr/local/bin/node
var fs = require('fs');

/*
var parse_string = function(buffer) {
	if (buffer.charAt[0] !== '\"') return '';
	var array_buffer = buffer.split('');

}
*/

var replace_list = [
	[', Inc.', ' Inc.'],
	['Architecture, Design & Engineering High', 'Architecture Design & Engineering High'],
	['Frankie Ray Jackson,', 'Frankie Ray Jackson'],
	['& \n', '& '],
	//['Mansfield Middle School 6-8', 'Mansfield Middle School'],
	//['(Type 2)', ''],
	//['6-8', ''],
	//['ReNEW Accelerated High School #1', 'ReNEW Accelerated High School (one)'],
	//['ReNEW Accelerated High School #2', 'ReNEW Accelerated High School (two)'],
	//[/\#\d+/, ''],
	//['McDonogh #35 Academy', 'McDonogh Academy'],
	//['McDonogh #32 Literacy Charter School', 'McDonogh Literacy Charter School'],
	//['McDonogh #32 Elementary School', 'McDonogh Elementary School'],
	//['Special School District #1', 'Special School District'],
	//['McDonogh 35 Career Academy', 'McDonogh Career Academy'],
	//['KIPP McDonogh 15 School for the Creative', 'KIPP McDonogh School for the Creative'],
	['The Louisiana Department of Education has modified and/or suppressed data reported to protect the privacy of students in compliance with the Family Educational Rights and Privacy Act (FERPA) codified at 20 U.S.C. 1232g. The strategies used to protect privacy vary and may include rounding or other techniques but do not substantially affect the general usefulness of the data. Because of the privacy protections, numerical and percentage totals may not add precisely to the sum of the row or column to which the total refers. NR indicates statistically unreliable (i.e. Less than 10 students in a subgroup or subgroup not defined at that time). The total number tested has been rounded down to the nearest 10 (i.e., 20 indicates there are between 20 and 29 students). The percent of students has been rounded when 1% or less and 99% or greater (e.g., ≤1% or ≤99%).', '']
];	

var is_duplicate = function(arr1, arr2) {
	if (arr1.length !== arr2.length) return false;

	for (var i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
}

var basedir = process.cwd();
basedir = basedir.substring(0, basedir.indexOf('LA_ED_Data') + 'LA_ED_Data'.length) + '/';

if (process.argv.length != 3) {
	// no file specified
	console.log("csv_strip: no input file.");
} else {
	// open the file
	fs.readFile(basedir + 'raw-csv/' + process.argv[2], function(err, data) {
		if (err !== null) {
			console.log(err);
			console.log("csv_strip: " + err.errno + " - " + err.code);
			return;
		}
		var file_contents = data.toString().replace(/\"/g, '');

		replace_list.forEach(function(e) {
			file_contents = file_contents.replace(e[0], e[1]);
		});

		// break by row
		var rows = file_contents.split('\n');

		// break row into cols
		var rows_cols = rows.map(function(e) {
			return e.split(',');
		});

		// clean numbers and switch NR to NA
		var cleaned = rows_cols.map(function(row) {
			var cleansed_row = row.map(function(item, itemIndex) {
				if (itemIndex !== 2 && item.match(/[+-]?(\d*\.)?\d+/) !== null && 
					String(Number(item.match(/[+-]?(\d*\.)?\d+/)[0])) === item)
					return Number(item.match(/[+-]?(\d*\.)?\d+/)[0]);
				else if (item.indexOf("NR") !== -1 || item.indexOf("~") !== -1) 
					return "NA"
				return item;
			});
			return cleansed_row; 
		});

		// remove duplicate rows
		for (var i = 0; i < cleaned.length; i++) {
			for (var j = i + 1; j < cleaned.length; j++) {
				if (is_duplicate(cleaned[i], cleaned[j])) {
					cleaned.splice(j, 1);
				}
			}
		}

		var num_cols = cleaned.reduce(function(prev, next) {
			if (prev.length > next.length) return prev; else return next;
		}).length;

		var stripped = cleaned.filter(function(row) {
			return row.filter(function(item) {
				if ((typeof item === 'number') || item.trim().length !== 0)
					return true;
			}).length >= num_cols - 4;
		});

		// remove blank colomns
		for (var i = 0; i < stripped[0].length; i++) {
			if (stripped[0][i].trim() === '') {
				var is_blank = true;
				for (var j = 1; j < stripped.length && is_blank; j++) {
					if (typeof stripped[j][i] === 'number' || stripped[j][i].trim() !== '') 
						is_blank = false;
				}
				if (is_blank) {
					stripped = stripped.map(function(row) {
						row.splice(i, 1);
						return row;
					});
				}
			}
		}

		// merge first two rows if non-numeric
		var first_is_non_numeric = true;
		for (var i = 0; i < stripped[0].length && first_is_non_numeric; i++) {
			//if (stripped[0][i].match(/[+-]?(\d*\.)?\d+/) !== null)
			if (typeof stripped[0][i] === 'number')
				first_is_non_numeric = false;
		}
		var second_is_non_numeric = true;
		for (var i = 0; i < stripped[1].length && second_is_non_numeric; i++) {
			//if (stripped[1][i].match(/[+-]?(\d*\.)?\d+/) !== null)
			if (typeof stripped[1][i] === 'number')
				second_is_non_numeric = false;
		}
		if (first_is_non_numeric && second_is_non_numeric) {
			for (var i = 0; i < stripped[0].length - 1; i ++) {
				if (stripped[0][i].length > 0 && stripped[0][i + 1].length === 0)
					stripped[0][i + 1] = stripped[0][i];
			}

			for (var i = 0; i < stripped[0].length; i ++) {
				stripped[0][i] += ' ' + stripped[1][i];
			}

			stripped.splice(1, 1);
		}

		// form voltron
		var old_file_name = process.argv[2].match(/[a-zA-Z0-9\-]+\.csv$/)[0]
		var new_file_name = basedir + 'eoc-data/' + old_file_name.replace(/\.csv$/, '.clean.csv');
		var new_contents = stripped.map(function(row) {
			return row.join(',');
		}).join('\n');

		fs.writeFile(new_file_name, new_contents, function(err) {
			if(err) {
				console.log("csv_strip: " + err.errno + " - " + err.code);
			}
		}); 
	});
}
