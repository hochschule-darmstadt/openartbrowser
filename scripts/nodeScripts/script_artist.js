// converts csv to json
const csvFilePath = 'artists.csv';
const jsonFilePath = 'artists.json';
const fs = require('fs');
const csv = require('fast-csv')
const _ = require('lodash');
const stream = fs.createReadStream(csvFilePath)

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
let ids = [];

const csvStream = csv({ delimiter: ';' })
	.on("data", function (data) {
		let myObj = _.cloneDeep(obj);
		if (numberOfLines !== 0 && !_.isEmpty(data) && !_.includes(ids, data[0])) {

			myObj.id = data[0];
			myObj.classes = constructArray(data[1]);
			myObj.label = data[2];
			myObj.description = data[3];
			myObj.image = data[4];
			myObj.gender = data[5];
			myObj.date_of_birth = data[6];
			myObj.date_of_death = data[7];
			myObj.place_of_birth = data[8];
			myObj.place_of_death = data[9];
			myObj.citizenship = data[10];
			myObj.movements = constructArray(data[11]);
			myObj.influenced_by = constructArray(data[12]);
			myObj.type = type;

			objArr.push(myObj);
			ids.push(myObj.id);
		}
		++numberOfLines;

	}).on('data-invalid', (err) => console.log("data invalid"))
	.on('end', () => {
		fs.writeFile(jsonFilePath, JSON.stringify(objArr), 'utf-8', (err) => {
			if (err)
				console.log(err);
			console.log(`${numberOfLines} lines processed.`);
		});
	})

stream.pipe(csvStream)

function constructArray(str) {
	let splittedString = str.split('');
	splittedString = _.without(splittedString, "'", '[', ']', " ");
	splittedString = splittedString.join('');
	return splittedString.split(',');
}