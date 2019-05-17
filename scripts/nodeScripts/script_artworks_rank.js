let fs = require('fs')
let _ = require('lodash')

const filePath = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/artworks.json'
const destPath = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/artworks_rank.json'
let readStream = fs.createReadStream(filePath, { flags: 'r', encoding: 'UTF-8' })

let buf = ''
let arrayData = []

readStream.on('data', function (data) {
	buf += data
}).on('close', function () {
	const monsterJson = JSON.parse(buf)
	const percentageStep = 1 / _.size(monsterJson)
	let percentage = 0
	_.each(monsterJson, function (obj) {
		let rank = 0
		_.each(obj, function (val, key) {
			if (val !== '' && !_.isEqual(val, [''])) {
				if (_.isArray(val)) {
					rank += val.length
				} else {
					++rank
				}
			}
		})
		obj.absoluteRank = rank;
	})
	let sortedByRank = sortByRank(monsterJson);
	_.each(sortedByRank, function (obj) {
		percentage += percentageStep
		obj.relativeRank = percentage
	})
	writeFileWithData(sortedByRank)
})


function sortByRank(data) {
	return _.sortBy(data, ['absoluteRank'])
}

function writeFileWithData(data) {
	fs.writeFile(destPath, JSON.stringify(data), function (err) {
		if (err)
			console.log('error occurred!')
	})
}