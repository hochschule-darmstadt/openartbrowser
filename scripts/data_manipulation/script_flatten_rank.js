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

let artistArr = []
let artworkArr = []
let genreArr = []
let locationArr = []
let materialArr = []
let movementArr = []
let objectArr = []

function constructObjects(stream, obj) {
	let buf = ''
	stream.on('data', function (chunk) {
		buf += chunk
	}).on('end', function () {
		_.assign(obj, JSON.parse(buf))
	})
	return stream
}

// convert json files to array of objects
constructObjects(artistStream, artistArr)
	.on('close', function () {
		constructObjects(artworksStream, artworkArr)
			.on('close', function () {
				constructObjects(genresStream, genreArr)
					.on('close', function () {
						constructObjects(locationsStream, locationArr)
							.on('close', function () {
								constructObjects(materialsStream, materialArr)
									.on('close', function () {
										constructObjects(movementsStream, movementArr)
											.on('close', function () {
												constructObjects(objectStream, objectArr)
													.on('close', function () {
														processData();
													})
											})
									})
							})
					})
			})
	})

/*	after converting all the json files into objects, this function concat these arrays and write 
	the result into master file as json
*/
function processData() {
	if (!_.isEmpty(artistArr) || !_.isEmpty(objectArr) || !_.isEmpty(artworkArr) || !_.isEmpty(genreArr)
		|| !_.isEmpty(locationArr) || !_.isEmpty(materialArr) || !_.isEmpty(movementArr)) {
		let monsterObj = artworkArr.concat(artistArr, objectArr, genreArr, locationArr, materialArr, movementArr)
		console.log(monsterObj.length)
		writeData(monsterObj);
	}
}

function writeData(obj) {
	fs.writeFile(master, JSON.stringify(obj), 'utf-8', function (err) {
		if (err) {
			console.log(err)
			return false
		}
	})
}