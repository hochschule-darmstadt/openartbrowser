const genresFilePath = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/genres.json'
const artworksFilePath = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/artworks_rank.json'
const destGenresFilePath = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/genres_rank.json'

const fs = require('fs')
const _ = require('lodash')

let genreReadStream = fs.createReadStream(genresFilePath, { flags: 'r', encoding: 'utf8' })
let artworksReadStream = fs.createReadStream(artworksFilePath, { flags: 'r', encoding: 'utf8' })

let buf = ''
let genresCounter = new Map()
let genreMonsterObj = {}

function openGenres() {
	genreReadStream.on('data', function (data) {
		buf += data
	}).on('end', function () {
		genreMonsterObj = JSON.parse(buf)
		_.each(genreMonsterObj, function (obj) {
			_.each(obj, function (val, key) {
				if (key === 'id') {
					if (!_.isUndefined(genresCounter.get(val)))
						console.log('this key already exits: ' + val)
					genresCounter.set(val, 0)
				}
			})
		})
	})
	return genreReadStream
}

function openArtworks() {
	buf = ''
	artworksReadStream.on('data', function (data) {
		buf += data
	}).on('end', function () {
		let undefinedData = 0
		_.each(JSON.parse(buf), function (obj) {
			_.each(obj, function (val, key) {
				if (key === 'genres') {
					_.each(val, function (genre) {
						if (_.isUndefined(genresCounter.get(genre))) {
							undefinedData++
							console.log(genre)
						}
						else
							genresCounter.set(genre, genresCounter.get(genre) + 1)
					})
				}
			})
		})
		console.log(`undefined data ${undefinedData}`)
	})
	return artworksReadStream;
}

function writeGenres() {
	let rankStep = 1 / _.size(genreMonsterObj)
	let percentage = 0
	_.each(genreMonsterObj, function (obj) {
		obj.absoluteRank = genresCounter.get(obj.id)
	})
	genreMonsterObj = sortByRank(genreMonsterObj);
	_.each(genreMonsterObj, function (obj) {
		obj.relativeRank = percentage
		percentage += rankStep
	})
	fs.writeFile(destGenresFilePath, JSON.stringify(genreMonsterObj), function (err) {
		if (err) throw err
		console.log('the file has been saved')
	})
}

function sortByRank(data) {
	return _.sortBy(data, ['absoluteRank'])
}

function init() {
	openGenres().on('close', function () {
		openArtworks().on('close', function () {
			writeGenres()
		})
	})
}

init()