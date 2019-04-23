const csvFilePath = 'genres.csv'; //file path
const jsonFilePath = 'genres.json';

const fs = require('fs');
const es = require('event-stream');
const _ = require('lodash');

const type = 'genre';
let numberOfLines = 0;
let obj = {
	id: '',
	classes: [],
	label: '',
	description: '',
	image: '',
	type: ''
}
let objArr = [];
let lines = [];

fs.createReadStream(csvFilePath)
	.pipe(es.split())
	.pipe(es.mapSync(function (line) {
		let myObj = _.cloneDeep(obj);
		if (numberOfLines !== 0 && !_.isEmpty(line) && !_.includes(lines, line)) {
			let splitedLine = line.split(';');

			myObj.id = splitedLine[0];
			myObj.classes = constructArray(splitedLine[1]);
			myObj.label = splitedLine[2];
			myObj.description = splitedLine[3];
			myObj.image = splitedLine[4];
			myObj.type = type;

			objArr.push(myObj);
			lines.push(line);
		}
		++numberOfLines;

	}).on('error', (err) => console.log(err))
		.on('end', () => {
			fs.writeFile(jsonFilePath, JSON.stringify(objArr), 'utf-8', (err) => {
				if (err)
					console.log(err);
				console.log(`${numberOfLines} lines processed.`);
			});
		})
	);
function constructArray(str) {
	let splittedString = str.split('');
	splittedString = _.without(splittedString, "'", '[', ']', " ");
	splittedString = splittedString.join('');
	return splittedString.split(',');
}