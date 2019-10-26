module.exports = {
	addLanguageColumns
}

// takes an internal object and adds language columns from csv data
// myObj - internal object prepared for saving it to json
// data - csv data
// langIndex - last index used by data + 1. Allows shifting language columns to shift position if needed
function addLanguageColumns(myObj, data, langIndex) {
			//add languages from csv to interal objects
			myObj.label_de = data[langIndex];
			myObj.description_de = data[langIndex + 1];
			myObj.label_it = data[langIndex + 2];
			myObj.description_it = data[langIndex + 3];
			myObj.label_fr = data[langIndex + 4];
			myObj.description_fr = data[langIndex + 5];
			myObj.label_es = data[langIndex + 6];
            myObj.description_es = data[langIndex + 7];
            return myObj;
}