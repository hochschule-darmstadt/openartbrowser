// adds ranking
const materialFilePath = 'materials.json'
const artworksFilePath = 'artworks_rank.json'
const destMaterialFilePath = 'materials_rank.json'

const fs = require('fs')
const _ = require('lodash')

let materialReadStream = fs.createReadStream(materialFilePath, { flags: 'r', encoding: 'utf8' })
let artworksReadStream = fs.createReadStream(artworksFilePath, { flags: 'r', encoding: 'utf8' })

let buf = ''
let materialsCounter = new Map()
let materialMonsterObj = {}

// TODO Add a short comment
function openMaterials() {
	materialReadStream.on('data', function (data) {
		buf += data
	}).on('end', function () {
		materialMonsterObj = JSON.parse(buf)
		_.each(materialMonsterObj, function (obj) {
			_.each(obj, function (val, key) {
				if (key === 'id') {
					if (!_.isUndefined(materialsCounter.get(val)))
						console.log('this key already exists: ' + val)
					materialsCounter.set(val, 0)
				}
			})
		})
	})
	return materialReadStream
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
				if (key === 'materials') {
					_.each(val, function (material) {
						if (_.isUndefined(materialsCounter.get(material))) {
							undefinedData++
							console.log(material)
						}
						else
							materialsCounter.set(material, materialsCounter.get(material) + 1)
					})
				}
			})
		})
		console.log(`undefined data ${undefinedData}`)
	})
	return artworksReadStream;
}

// TODO Add a short comment
function writeMaterials() {
	let rankStep = 1 / _.size(materialMonsterObj)
	let percentage = 0
	_.each(materialMonsterObj, function (obj) {
		obj.absoluteRank = materialsCounter.get(obj.id)
	})
	materialMonsterObj = sortByRank(materialMonsterObj);
	_.each(materialMonsterObj, function (obj) {
		obj.relativeRank = percentage
		percentage += rankStep
	})
	fs.writeFile(destMaterialFilePath, JSON.stringify(materialMonsterObj), function (err) {
		if (err) throw err
		console.log('the file has been saved')
	})
}

function sortByRank(data) {
	return _.sortBy(data, ['absoluteRank'])
}

function init() {
	openMaterials().on('close', function () {
		openArtworks().on('close', function () {
			writeMaterials()
		})
	})
}

init()