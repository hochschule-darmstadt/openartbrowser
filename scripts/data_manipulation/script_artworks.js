// converts csv to json
const csvFilePath = 'artworks.csv';
const jsonFilePath = 'artworks.json';

const fs = require('fs');
const es = require('event-stream');
const _ = require('lodash');
const csv = require('fast-csv')
const stream = fs.createReadStream(csvFilePath)
const helper = require("./helper");
const addlanguage = require("./addlanguage");
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
			myObj.creators = helper.constructArray(data[5]);
			myObj.locations = helper.constructArray(data[6]);
			myObj.genres = helper.constructArray(data[7]);
			myObj.movements = helper.constructArray(data[8]);
			myObj.inception = data[9];
			myObj.materials = helper.constructArray(data[10]);
			myObj.depicts = helper.constructArray(data[11]);
			myObj.country = data[12];
			myObj.height = data[13];
			myObj.width = data[14];
			myObj.type = type;

			//add languages from csv to interal objects
			myObj = addlanguage.addLanguageColumns(myObj, data, 16);
			//let langIndex = 15;
			// myObj.label_de = data[langIndex];
			// myObj.description_de = data[langIndex + 1];
			// myObj.label_it = data[langIndex + 2];
			// myObj.description_it = data[langIndex + 3];
			// myObj.label_fr = data[langIndex + 4];
			// myObj.description_fr = data[langIndex + 5];
			// myObj.label_es = data[langIndex + 6];
			// myObj.description_es = data[langIndex + 7];

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
