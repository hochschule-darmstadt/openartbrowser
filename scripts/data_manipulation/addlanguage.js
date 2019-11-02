module.exports = {
	getLanguageConfigKeys,
	addLanguageFields,
	getLanguageConstruct,
	addLanguageValues
}

var fs = require('fs');
const csvFilePath = './../../languageconfig.csv';
const csv = require('fast-csv');


var options = {
	delimiter: ';',
	headers: true,
	discardUnmappedColumns: true,
	quote: null,
	ignoreEmpty: true,
	trim: true
  };

function getLanguageConfig() {
	var read = fs.createReadStream(csvFilePath)
		.pipe(csv.parse(options))
		.on('data', function (data) {  // this function executes once the data has been retrieved
			console.log(data);  // data is already an array
		})
		.on('data-invalid', (err) => console.log("Error! data invalid"))
		.on('end', function (data) {
			console.log('Read finished');
			return data;
		})
	
}




//Returns languageArray length for json processing/definition
// function getLanguageConfigCount(langcount){
// 	new Promise(function(resolve, reject) {
// 	var read =  fs.createReadStream(csvFilePath)
// 	.pipe(csv.parse(options))
// 	.on('data', function (data) {  // this function executes once the data has been retrieved
// 		langArrayKeys.push(data['langkey']);
// 	})
// 	.on('data-invalid', (err) => reject)
// 	.on('error', (err) => reject)
// 	.on('end', function (data) {
// 		resolve(langcount = langArrayKeys.length);
// 		console.log("Language array length: " + langcount);
// 		return langcount;
// 	})});	
// }

//Returns languageArray length for json processing/definition
//Defined as promise since usage of pipe and on event handlern cause asynchronous exec
function getLanguageConfigKeys(langArrayKeys){

	// var read = fs.createReadStream(csvFilePath)
	// .pipe(csv.parse(options))
	// .on('data', function (data) {  // this function executes once the data has been retrieved
	// 	console.log(data); 
	// 	langArrayKeys.push(data['langkey']);
	// })
	// .on('data-invalid', (err) => reject("Error! data invalid"))
	// .on('end', function (data) {
	// 	console.log(langArrayKeys);
	// })
	// return new Promise(function(resolve, reject){
	// read.on('finish', () => resolve(langArrayKeys))
	// });	
	var data = fs.readFileSync(csvFilePath)
    .toString() // convert Buffer to string
	.split('\r') // split string to lines
    .map(e => e.trim()) // remove white spaces for each line
	.map(e => e.split(';').map(e => e.trim())
	); // split each line to array
	data.shift() //removes headline
	console.log(data);
	langArrayKeys = data;
	return langArrayKeys;
}


//Gets language construct as building block for language aspect of json file
function getLanguageConstruct()
{
	//language generic struct
	let languageconstruct = {};
	//Define attributes
	let nodeName = 'languages';
	let langidName = 'langid';
	let labelName = 'label';
	let descriptionName = 'description';
	//Construct
	languageconstruct [ nodeName ] = {};
	let langidField = languageconstruct [ nodeName ];
	let labelField = languageconstruct [ nodeName ];
	let descriptionField = languageconstruct [ nodeName ];
	langidField [ langidName ] = [ ].push ( [{ }] );
	labelField [ labelName ] = [ ].push ( [{ }] );
	descriptionField [ descriptionName ] = [ ].push ( [{ }] );
	return languageconstruct;
	// let theArrayOfObjects = langidField [ langidVal ];
	// let theArrayOfObjects2 = langidField [ labelVal ];
	// let theArrayOfObjects3 = langidField [ descriptionVal ];
}
// adds languages fileds to json schema. 
// obj is the json schema. Needs languages field (? maybe)
// langkeys the language keys from configuration
function addLanguageFields(obj, langkeys)
{
	let languageNode = {};
	languageNode = getLanguageConstruct();

	for(var i = 0, len = langkeys.length; i <= len; i++){
		obj ['languages'][i] = languageNode['languages'];
		//obj ['languages'][i]['langid'] = 'hello';
		console.log(obj['languages'][i]['langid'])
		//obj.languages[i] = langkeys[i];
		//obj.languages[i] = langkeys[i];
		//obj.languages[i] = langkeys[i];
	}
	return obj;

}

// takes an internal object and adds language columns from csv data
// myObj - internal object prepared for saving it to json
// data - csv data
// langIndex - last index used by data + 1. Allows shifting language columns to shift position if needed
// langIndex - array with language keys inside
function addLanguageValues(myObj, data, langindex, langkeys) {

	for(var i = 0, len = langkeys.length; i <= len; i++){
		//jump to next language in data csv considering every language has n tags
		let loop = i%((data.length - (langindex - 1)) / langkeys.length)
		myObj.languages[i]['langid'] = langkeys[i];
		myObj.languages[i]['label'] = data[langIndex+loop];
		myObj.languages[i]['description'] = data[langIndex+1+loop];
	}
	return myObj;
	// //get languageconfig array
	// var langarray = getLanguageConfig();
	// //add languages from csv to interal objects
	// try {
	// 	//may throw because of index out of range
	// 	myObj.label_de = data[langIndex];
	// } catch (ex) {
	// 	myObj.label_de = "";
	// }
	// try {
	// 	//may throw because of index out of range
	// 	mmyObj.description_de = data[langIndex + 1];
	// } catch (ex) {
	// 	myObj.description_de = "";
	// }
	// try {
	// 	//may throw because of index out of range
	// 	myObj.label_it = data[langIndex + 2];
	// } catch (ex) {
	// 	myObj.label_it = "";
	// }
	// try {
	// 	//may throw because of index out of range
	// 	myObj.description_it = data[langIndex + 3];
	// } catch (ex) {
	// 	myObj.description_it = "";
	// }
	// try {
	// 	//may throw because of index out of range
	// 	myObj.label_fr = data[langIndex + 4];
	// } catch (ex) {
	// 	myObj.label_fr = "";
	// }
	// try {
	// 	//may throw because of index out of range
	// 	myObj.description_fr = data[langIndex + 5];
	// } catch (ex) {
	// 	myObj.description_fr = "";
	// }
	// try {
	// 	//may throw because of index out of range
	// 	myObj.label_es = data[langIndex + 6];
	// } catch (ex) {
	// 	myObj.label_es = "";
	// }
	// try {
	// 	//may throw because of index out of range
	// 	myObj.description_fr = data[langIndex + 7];
	// } catch (ex) {
	// 	myObj.description_fr = "";
	// }
	// // myObj.label_de = data[langIndex];
	// // myObj.description_de = data[langIndex + 1];
	// // myObj.label_it = data[langIndex + 2];
	// // myObj.description_it = data[langIndex + 3];
	// // myObj.label_fr = data[langIndex + 4];
	// // myObj.description_fr = data[langIndex + 5];
	// // myObj.label_es = data[langIndex + 6];
	// // myObj.description_es = data[langIndex + 7];
	// return myObj;
}