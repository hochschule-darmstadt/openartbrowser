// adds ranking
const objectFilePath = 'objects.json'
const artworksFilePath = 'artworks_rank.json'
const destObjectFilePath = 'objects_rank.json'

const fs = require('fs')
const _ = require('lodash')

let objectReadStream = fs.createReadStream(objectFilePath, { flags: 'r', encoding: 'utf8' })
let artworksReadStream = fs.createReadStream(artworksFilePath, { flags: 'r', encoding: 'utf8' })

let buf = ''
let objectsCounter = new Map()
let objectMonsterObj = {}

// TODO Add a short comment
function openObjects() {
	objectReadStream.on('data', function (data) {
		buf += data
	}).on('end', function () {
		objectMonsterObj = JSON.parse(buf)
		_.each(objectMonsterObj, function (obj) {
			_.each(obj, function (val, key) {
				if (key === 'id') {
					if (!_.isUndefined(objectsCounter.get(val)))
						console.log('this key already exits: ' + val)
					objectsCounter.set(val, 0)
				}
			})
		})
	})
	return objectReadStream
}

// TODO Add a short comment
function openArtworks() {
	buf = ''
	artworksReadStream.on('data', function (data) {
		buf += data
	}).on('end', function () {
		let undefinedData = 0
		_.each(JSON.parse(buf), function (obj) {
			_.each(obj, function (val, key) {
				if (key === 'depicts') {
					_.each(val, function (depict) {
						if (_.isUndefined(objectsCounter.get(depict))) {
							undefinedData++
							console.log(depict)
						}
						else
							objectsCounter.set(depict, objectsCounter.get(depict) + 1)
					})
				}
			})
		})
		console.log(`undefined data ${undefinedData}`)
	})
	return artworksReadStream;
}

// TODO Add a short comment
function writeObjects() {
	let rankStep = 1 / _.size(objectMonsterObj)
	let percentage = 0
	_.each(objectMonsterObj, function (obj) {
		obj.absoluteRank = objectsCounter.get(obj.id)
	})
	objectMonsterObj = sortByRank(objectMonsterObj);
	_.each(objectMonsterObj, function (obj) {
		obj.relativeRank = percentage
		percentage += rankStep
	})
	fs.writeFile(destObjectFilePath, JSON.stringify(objectMonsterObj), function (err) {
		if (err) throw err
		console.log('the file has been saved')
	})
}

function sortByRank(data) {
	return _.sortBy(data, ['absoluteRank'])
}

function init() {
	openObjects().on('close', function () {
		openArtworks().on('close', function () {
			writeObjects()
		})
	})
}

init()