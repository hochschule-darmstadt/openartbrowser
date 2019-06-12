// converts csv to json
const csvFilePath = 'artworks.csv';
const jsonFilePath = 'artworks.json';

const fs = require('fs');
const es = require('event-stream');
const _ = require('lodash');
const csv = require('fast-csv')
const stream = fs.createReadStream(csvFilePath)
const type = 'artwork';
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
			myObj.creators = constructArray(data[5]);
			myObj.locations = constructArray(data[6]);
			myObj.genres = constructArray(data[7]);
			myObj.movements = constructArray(data[8]);
			myObj.inception = data[9];
			myObj.materials = constructArray(data[10]);
			myObj.depicts = constructArray(data[11]);
			myObj.country = data[12];
			myObj.height = data[13];
			myObj.width = data[14];
			myObj.type = type;

			objArr.push(myObj);
			ids.push(myObj.id);
		}
		++numberOfLines;

	}).on('data-invalid', (err) => console.log("error! data invalid"))
	.on('end', () => {
		fs.writeFile(jsonFilePath, JSON.stringify(objArr), 'utf-8', (err) => {
			if (err)
				console.log(err);
			console.log(`${numberOfLines} lines processed.`);
		});
	})

stream.pipe(csvStream)

// TODO Add a short comment
function constructArray(str) {
	let splittedString = str.split('');
	splittedString = _.without(splittedString, "'", '[', ']', " ");
	splittedString = splittedString.join('');
	return splittedString.split(',');
}