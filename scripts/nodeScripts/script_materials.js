const csvFilePath = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/ArtOntology/materials.csv';
const jsonFilePath = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/materials.json';
const csv = require('fast-csv')
const fs = require('fs');
const _ = require('lodash');
const stream = fs.createReadStream(csvFilePath)

const type = 'material';
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
			myObj.type = type;

			objArr.push(myObj);
			ids.push(myObj.id);
		}
		++numberOfLines;

	}).on('data-invalid', (err) => console.log("err"))
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