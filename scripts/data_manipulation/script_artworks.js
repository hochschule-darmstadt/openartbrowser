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
	abstract: '',
	wikipediaLink: '',
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
			myObj.artists = helper.constructArray(data[7]);
			myObj.locations = helper.constructArray(data[8]);
			myObj.genres = helper.constructArray(data[9]);
			myObj.movements = helper.constructArray(data[10]);
			myObj.inception = data[11];
			myObj.materials = helper.constructArray(data[12]);
			myObj.motifs = helper.constructArray(data[13]);
			myObj.country = data[14];
			myObj.height = data[15];
			myObj.width = data[16];

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
