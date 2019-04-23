const fs = require('fs');
const es = require('event-stream');
const _ = require('lodash');

const filePath = 'master.json'; //file path
const jsonFilePath = 'master_flat.json';
let numberOfLines = 0;
let flattenArray = [];
let lines = '';

fs.createReadStream(filePath)
	.pipe(es.split())
	.pipe(es.mapSync(function (line) {
		if (!_.isEmpty(line)) {
			lines += line;
			numberOfLines++;
		}
	}).on('error', (err) => console.log(err))
		.on('end', (data) => {
			flattenArray = _.flatten(JSON.parse(lines)); 
			fs.writeFile(jsonFilePath, JSON.stringify(flattenArray), 'utf-8', (err) => {
				if (err)
					console.log(err);
				console.log(`${numberOfLines} lines processed.`);
			});
		})
	);