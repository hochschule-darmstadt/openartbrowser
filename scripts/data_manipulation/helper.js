const _ = require('lodash');
module.exports = {
	constructArray
}

// takes a string like:"['Q12421', 'Q93202']" and returns an array => ["Q12421", "Q93202"]
function constructArray(str) {
	let splittedString = str.split('');
	splittedString = _.without(splittedString, "'", '[', ']', " ");
	splittedString = splittedString.join('');
	return splittedString.split(',');
}
