const fs = require('fs')
const _ = require('lodash')

const artists = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/artists_rank.json'
const artworks = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/artworks_rank.json'
const genres = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/genres_rank.json'
const locations = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/locations_rank.json'
const materials = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/materials_rank.json'
const movements = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/movements_rank.json'
const objects = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/objects_rank.json'
const master = '/Users/marouanekherrabi/Documents/STUDY/PSE/ArtOntology/jsonData/master_flat_rank.json'

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