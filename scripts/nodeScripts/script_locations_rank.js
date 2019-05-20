const locationFilePath = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/locations.json'
const artworksFilePath = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/artworks_rank.json'
const destLocationFilePath = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/locations_rank.json'

const fs = require('fs')
const _ = require('lodash')

let locationReadStream = fs.createReadStream(locationFilePath, { flags: 'r', encoding: 'utf8' })
let artworksReadStream = fs.createReadStream(artworksFilePath, { flags: 'r', encoding: 'utf8' })

let buf = ''
let locationsCounter = new Map()
let locationMonsterObj = {}

function openArtists() {
	locationReadStream.on('data', function (data) {
		buf += data
	}).on('end', function () {
		locationMonsterObj = JSON.parse(buf)
		_.each(locationMonsterObj, function (obj) {
			_.each(obj, function (val, key) {
				if (key === 'id') {
					if (!_.isUndefined(locationsCounter.get(val)))
						console.log('this key already exits: ' + val)
					locationsCounter.set(val, 0)
				}
			})
		})
	})
	return locationReadStream
}

function openArtworks() {
	buf = ''
	artworksReadStream.on('data', function (data) {
		buf += data
	}).on('end', function () {
		let undefinedData = 0
		_.each(JSON.parse(buf), function (obj) {
			_.each(obj, function (val, key) {
				if (key === 'locations') {
					_.each(val, function (location) {
						if (_.isUndefined(locationsCounter.get(location))) {
							undefinedData++
							console.log(location)
						}
						else
							locationsCounter.set(location, locationsCounter.get(location) + 1)
					})
				}
			})
		})
		console.log(`undefined data ${undefinedData}`)
	})
	return artworksReadStream;
}

function writeArtists() {
	let rankStep = 1 / _.size(locationMonsterObj)
	let percentage = 0
	_.each(locationMonsterObj, function (obj) {
		obj.absoluteRank = locationsCounter.get(obj.id)
	})
	locationMonsterObj = sortByRank(locationMonsterObj);
	_.each(locationMonsterObj, function (obj) {
		obj.relativeRank = percentage
		percentage += rankStep
	})
	fs.writeFile(destLocationFilePath, JSON.stringify(locationMonsterObj), function (err) {
		if (err) throw err
		console.log('the file has been saved')
	})
}

function sortByRank(data) {
	return _.sortBy(data, ['absoluteRank'])
}

function init() {
	openArtists().on('close', function () {
		openArtworks().on('close', function () {
			writeArtists()
		})
	})
}

init()