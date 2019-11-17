//adds ranking
const artistFilePath = 'artists.json'
const artworksFilePath = 'artworks_rank.json'
const destinationArtistFilePath = 'artists_rank.json'

const fs = require('fs')
const _ = require('lodash')

let artistReadStream = fs.createReadStream(artistFilePath, { flags: 'r', encoding: 'utf8' })
let artworksReadStream = fs.createReadStream(artworksFilePath, { flags: 'r', encoding: 'utf8' })

let buf = ''
let artistsCounter = new Map()
let artistMonsterObj = {}

// sets the value of each artist id in the artistsCounter Map to 0
function openArtists() {
	artistReadStream.on('data', function (data) {
		buf += data
	}).on('end', function () {
		artistMonsterObj = JSON.parse(buf)
		_.each(artistMonsterObj, function (obj) {
			_.each(obj, function (val, key) {
				if (key === 'id') {
					if (!_.isUndefined(artistsCounter.get(val)))
						console.log('this key already exits: ' + val)
					artistsCounter.set(val, 0)
				}
			})
		})
	})
	return artistReadStream
}

// counts the occurrence of each artist id
function openArtworks() {
	buf = ''
	artworksReadStream.on('data', function (data) {
		buf += data
	}).on('end', function () {
		let undefinedData = 0
		_.each(JSON.parse(buf), function (obj) {
			_.each(obj, function (val, key) {
				if (key === 'artists') {
					_.each(val, function (artist) {
						if (_.isUndefined(artistsCounter.get(artist))) {
							undefinedData++
						}
						else
							artistsCounter.set(artist, artistsCounter.get(artist) + 1)
					})
				}
			})
		})
		console.log(`undefined data ${undefinedData}`)
	})
	return artworksReadStream;
}

/*	1-calculate the absolute rank of each artist and add that property to the corresponding object
	2-sort the artists by absoluteRank
	3-Calcute the relativeRank
	4-write the data to the destinationArtistFilePath
*/
function writeArtists() {
	let rankStep = 1 / _.size(artistMonsterObj)
	let percentage = 0
	_.each(artistMonsterObj, function (obj) {
		obj.absoluteRank = artistsCounter.get(obj.id)
	})
	artistMonsterObj = sortByRank(artistMonsterObj);
	_.each(artistMonsterObj, function (obj) {
		obj.relativeRank = percentage
		percentage += rankStep
	})
	fs.writeFile(destinationArtistFilePath, JSON.stringify(artistMonsterObj), function (err) {
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
