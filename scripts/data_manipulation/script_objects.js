// converts csv file to json file
const csvFilePath = 'objects.csv';
const jsonFilePath = 'objects.json';
const csv = require('fast-csv')
const fs = require('fs');
const es = require('event-stream');
const _ = require('lodash');
const helper = require("./helper")
const addlanguage = require("./addlanguage")
const stream = fs.createReadStream(csvFilePath)
const type = 'object';
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
			myObj.classes = helper.constructArray(data[1]);
			myObj.label = data[2];
			myObj.description = data[3];
			myObj.image = data[4];
			myObj.type = type;

			//add languages from csv to interal objects
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