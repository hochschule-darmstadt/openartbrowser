const csvFilePath = 'artists.csv'; //file path
const jsonFilePath = 'artists.json';

const fs = require('fs');
const es = require('event-stream');
const _ = require('lodash');

const type = 'artist';
let numberOfLines = 0;
let obj = {
	id: '',
	classes: [],
	label: '',
	description: '',
	image: '',
	gender: '',
	date_of_birth: '',
	date_of_death: '',
	place_of_birth: '',
	place_of_death: '',
	citizenship: '',
	movements: [],
	influenced_by: [],
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
			myObj.gender = splitedLine[5];
			myObj.date_of_birth = splitedLine[6];
			myObj.date_of_death = splitedLine[7];
			myObj.place_of_birth = splitedLine[8];
			myObj.place_of_death = splitedLine[9];
			myObj.citizenship = splitedLine[10];
			myObj.movements = constructArray(splitedLine[11]);
			myObj.influenced_by = constructArray(splitedLine[12]);
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