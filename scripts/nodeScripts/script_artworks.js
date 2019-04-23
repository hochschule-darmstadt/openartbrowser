const csvFilePath = 'artworks.csv';
const jsonFilePath = 'artworks.json';

const fs = require('fs');
const es = require('event-stream');
const _ = require('lodash');
const type = 'artworks';
let numberOfLines = 0;
let obj = {
	id: '',
	classes: [],
	label: '',
	description: '',
	image: '',
	creators: [],
	locations: [],
	genres: [],
	movements: [],
	inception: '',
	materials: [],
	depicts: [],
	country: '',
	height: '',
	width: '',
	type: '',
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
			myObj.creators = constructArray(splitedLine[5]);
			myObj.locations = constructArray(splitedLine[6]);
			myObj.genres = constructArray(splitedLine[7]);
			myObj.movements = constructArray(splitedLine[8]);
			myObj.inception = splitedLine[9];
			myObj.materials = constructArray(splitedLine[10]);
			myObj.depicts = constructArray(splitedLine[11]);
			myObj.country = splitedLine[12];
			myObj.height = splitedLine[13];
			myObj.width = splitedLine[14];

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