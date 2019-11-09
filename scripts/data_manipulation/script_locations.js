// converts csv to json
const csvFilePath = 'locations.csv';
const jsonFilePath = 'locations.json';
const csv = require('fast-csv')
const fs = require('fs');
const _ = require('lodash');
const helper = require("./helper")
const stream = fs.createReadStream(csvFilePath)

const type = 'location';
let numberOfLines = 0;
let obj = {
	id: '',
	classes: [],
	label: '',
	description: '',
	image: '',
	country: '',
	website: '',
	part_of: [],
	lat: 0,
	lon: 0,
	type: ''
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
			myObj.country = data[5];
			myObj.website = data[6];
			myObj.part_of =helper.constructArray(data[7]);
			myObj.lat = parseFloat(data[8]);
			myObj.lon = parseFloat(data[9]);
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
