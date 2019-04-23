const csvFilePath = 'locations.csv'; //file path
const jsonFilePath = 'locations.json';

const fs = require('fs');
const es = require('event-stream');
const _ = require('lodash');

const type = 'location';
let numberOfLines = 0;
let obj = {
	id: '',
	classes: [],
	label: '',
	description: '',
	image: '',
	country: '',
	website: '',
	part_of: [],
	lat: 0,
	lon: 0,
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
			myObj.country = splitedLine[5];
			myObj.website = splitedLine[6];
			myObj.part_of = constructArray(splitedLine[7]);
			myObj.lat = parseFloat(splitedLine[8]);
			myObj.lon = parseFloat(splitedLine[9]);
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