// adds ranking
let fs = require('fs')
let _ = require('lodash')

const filePath = 'artworks.json'
const destPath = 'artworks_rank.json'
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
	fs.writeFile(destPath, JSON.stringify(data), 'utf-8', function (err) {
		if (err)
			console.log('error occurred!')
	})
}
