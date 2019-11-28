// converts csv to json
const csvFilePath = 'artworks.csv';
const jsonFilePath = 'artworks.json';

const fs = require('fs');
const es = require('event-stream');
const _ = require('lodash');
const csv = require('fast-csv')
const stream = fs.createReadStream(csvFilePath)
const helper = require("./helper")
const type = 'artwork';
let numberOfLines = 0;
let obj = {
	id: '',
	classes: [],
	label: '',
	description: '',
	image: '',
	abstract: '',
	wikipediaLink: '',
	label_en: '',
	description_en: '',
	label_de: '',
	description_de: '',
	label_fr: '',
	description_fr: '',
	label_it: '',
	description_it: '',
	label_es: '',
	description_es: '',
	artists: [],
	locations: [],
	genres: [],
	movements: [],
	inception: '',
	materials: [],
	motifs: [],
	country: '',
	height: '',
	width: '',
	type: '',
	country_en: '',
	country_de: '',
	country_fr: '',
	country_it: '',
	country_es: '',
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
			myObj.abstract = data[5];
			myObj.wikipediaLink = data[6];
			myObj.label_en = data[7];
			myObj.description_en = data[8];
			myObj.label_de = data[9];
			myObj.description_de = data[10];
			myObj.label_fr = data[11];
			myObj.description_fr = data[12];
			myObj.label_it = data[13];
			myObj.description_it = data[14];
			myObj.label_es = data[15];
			myObj.description_es = data[16];
			myObj.artists = helper.constructArray(data[17]);
			myObj.locations = helper.constructArray(data[18]);
			myObj.genres = helper.constructArray(data[19]);
			myObj.movements = helper.constructArray(data[20]);
			myObj.inception = data[21];
			myObj.materials = helper.constructArray(data[22]);
			myObj.motifs = helper.constructArray(data[23]);
			myObj.country = data[24];
			myObj.height = data[25];
			myObj.width = data[26];
			myObj.country_en = data[27];
			myObj.country_de = data[28];
			myObj.country_fr = data[29];
			myObj.country_it = data[30];
			myObj.country_es = data[31];

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
