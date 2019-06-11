// combines all the json files
const fs = require('fs')
const _ = require('lodash')

const artists = 'artists_rank.json'
const artworks = 'artworks_rank.json'
const genres = 'genres_rank.json'
const locations = 'locations_rank.json'
const materials = 'materials_rank.json'
const movements = 'movements_rank.json'
const objects = 'objects_rank.json'
const master = 'master_flat_rank.json'

const artistStream = fs.createReadStream(artists, { flags: 'r', encoding: 'utf8' })
const artworksStream = fs.createReadStream(artworks, { flags: 'r', encoding: 'utf8' })
const genresStream = fs.createReadStream(genres, { flags: 'r', encoding: 'utf8' })
const locationsStream = fs.createReadStream(locations, { flags: 'r', encoding: 'utf8' })
const materialsStream = fs.createReadStream(materials, { flags: 'r', encoding: 'utf8' })
const movementsStream = fs.createReadStream(movements, { flags: 'r', encoding: 'utf8' })
const objectStream = fs.createReadStream(objects, { flags: 'r', encoding: 'utf8' })

let artistObj = []
let artworkObj = []
let genreObj = []
let locationObj = []
let materialObj = []
let movementObj = []
let objectObj = []

function constructObjects(stream, obj) {
	let buf = ''
	stream.on('data', function (chunk) {
		buf += chunk
	}).on('end', function () {
		_.assign(obj, JSON.parse(buf))
	})
	return stream
}

constructObjects(artistStream, artistObj)
	.on('close', function () {
		constructObjects(artworksStream, artworkObj)
			.on('close', function () {
				constructObjects(genresStream, genreObj)
					.on('close', function () {
						constructObjects(locationsStream, locationObj)
							.on('close', function () {
								constructObjects(materialsStream, materialObj)
									.on('close', function () {
										constructObjects(movementsStream, movementObj)
											.on('close', function () {
												constructObjects(objectStream, objectObj)
													.on('close', function () {
														processData();
													})
											})
									})
							})
					})
			})
	})

function processData() {
	if (!_.isEmpty(artistObj) && !_.isEmpty(objectObj) && !_.isEmpty(artworkObj) && !_.isEmpty(genreObj)
		&& !_.isEmpty(locationObj) && !_.isEmpty(materialObj) && !_.isEmpty(movementObj)) {
		let monsterObj = artworkObj.concat(artistObj, objectObj, genreObj, locationObj, materialObj, movementObj)
		console.log(monsterObj.length)
		writeData(monsterObj);
	}
}

function writeData(obj) {
	fs.writeFile(master, JSON.stringify(obj), function (err) {
		if (err) {
			console.log(err)
			return false
		}
	})
}