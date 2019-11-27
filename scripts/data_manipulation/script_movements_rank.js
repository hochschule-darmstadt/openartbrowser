//adds ranking
const movementFilePath = 'movements.json'
const artworksFilePath = 'artworks_rank.json'
const destMovementFilePath = 'movements_rank.json'

const fs = require('fs')
const _ = require('lodash')

let movementsReadStream = fs.createReadStream(movementFilePath, { flags: 'r', encoding: 'utf8' })
let artworksReadStream = fs.createReadStream(artworksFilePath, { flags: 'r', encoding: 'utf8' })

let buf = ''
let movementsCounter = new Map()
let movementMonsterObj = {}

function openMovements() {
	movementsReadStream.on('data', function (data) {
		buf += data
	}).on('end', function () {
		movementMonsterObj = JSON.parse(buf)
		_.each(movementMonsterObj, function (obj) {
			_.each(obj, function (val, key) {
				if (key === 'id') {
					if (!_.isUndefined(movementsCounter.get(val)))
						console.log('this key already exits: ' + val)
					movementsCounter.set(val, 0)
				}
			})
		})
	})
	return movementsReadStream
}

function openArtworks() {
	buf = ''
	artworksReadStream.on('data', function (data) {
		buf += data
	}).on('end', function () {
		let undefinedData = 0
		_.each(JSON.parse(buf), function (obj) {
			_.each(obj, function (val, key) {
				if (key === 'movements') {
					_.each(val, function (movement) {
						if (_.isUndefined(movementsCounter.get(movement))) {
							undefinedData++
							console.log(movement)
						}
						else
							movementsCounter.set(movement, movementsCounter.get(movement) + 1)
					})
				}
			})
		})
		console.log(`undefined data ${undefinedData}`)
	})
	return artworksReadStream;
}

function writeMovements() {
	let rankStep = 1 / _.size(movementMonsterObj)
	let percentage = 0
	_.each(movementMonsterObj, function (obj) {
		obj.absoluteRank = movementsCounter.get(obj.id)
	})
	movementMonsterObj = sortByRank(movementMonsterObj);
	_.each(movementMonsterObj, function (obj) {
		obj.relativeRank = percentage
		percentage += rankStep
	})
	fs.writeFile(destMovementFilePath, JSON.stringify(movementMonsterObj), 'utf-8', function (err) {
		if (err) throw err
		console.log('the file has been saved')
	})
}

function sortByRank(data) {
	return _.sortBy(data, ['absoluteRank'])
}

function init() {
	openMovements().on('close', function () {
		openArtworks().on('close', function () {
			writeMovements()
		})
	})
}

init()
