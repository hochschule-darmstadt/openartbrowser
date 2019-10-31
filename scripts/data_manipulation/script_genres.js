//converts csv to json
const csvFilePath = 'genres.csv';
const jsonFilePath = 'genres.json';

const fs = require('fs');
const csv = require('fast-csv')
const _ = require('lodash');
const stream = fs.createReadStream(csvFilePath)
const helper = require("./helper")
const addlanguage = require("./addlanguage")
const type = 'genre';
let numberOfLines = 0;
let obj = {
	id: '',
	classes: [],
	label: '',
	description: '',
	image: '',
	type: '',
	label_de: '',
	description_de: '',
	label_it: '',
	description_it: '',
	label_fr: '',
	description_fr: '',
	label_es: '',
	description_es: ''
}
let objArr = [];
let ids = [];

const csvStream = csv({ delimiter: ';' })
	.on("data", function (data) {
		let myObj = _.cloneDeep(obj);
		if (numberOfLines !== 0 && !_.isEmpty(data) && !_.includes(ids, data[0])) {

			myObj.id = data[0];
			myObj.classes =helper.constructArray(data[1]);
			myObj.label = data[2];
			myObj.description = data[3];
			myObj.image = data[4];
			myObj.type = type;

			myObj = addlanguage.addLanguageColumns(myObj, data, 6);
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
