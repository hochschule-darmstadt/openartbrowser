// adds ranking
const motifFilePath = 'motifs.json';
const artworksFilePath = 'artworks_rank.json';
const destMotifFilePath = 'motifs_rank.json';

const fs = require('fs');
const _ = require('lodash');

let motifReadStream = fs.createReadStream(motifFilePath, {
  flags: 'r',
  encoding: 'utf8'
});
let artworksReadStream = fs.createReadStream(artworksFilePath, {
  flags: 'r',
  encoding: 'utf8'
});

let buf = '';
let motifsCounter = new Map();
let motifMonsterObj = {};

function openMotifs() {
  motifReadStream
    .on('data', function(data) {
      buf += data;
    })
    .on('end', function() {
      motifMonsterObj = JSON.parse(buf);
      _.each(motifMonsterObj, function(obj) {
        _.each(obj, function(val, key) {
          if (key === 'id') {
            if (!_.isUndefined(motifsCounter.get(val))) console.log('this key already exits: ' + val);
            motifsCounter.set(val, 0);
          }
        });
      });
    });
  return motifReadStream;
}

function openArtworks() {
  buf = '';
  artworksReadStream
    .on('data', function(data) {
      buf += data;
    })
    .on('end', function() {
      let undefinedData = 0;
      _.each(JSON.parse(buf), function(obj) {
        _.each(obj, function(val, key) {
          if (key === 'motifs') {
            _.each(val, function(motif) {
              if (_.isUndefined(motifsCounter.get(motif))) {
                undefinedData++;
                console.log(motif);
              } else motifsCounter.set(motif, motifsCounter.get(motif) + 1);
            });
          }
        });
      });
      console.log(`undefined data ${undefinedData}`);
    });
  return artworksReadStream;
}

function writeMotifs() {
  let rankStep = 1 / _.size(motifMonsterObj);
  let percentage = 0;
  _.each(motifMonsterObj, function(obj) {
    obj.absoluteRank = motifsCounter.get(obj.id);
  });
  motifMonsterObj = sortByRank(motifMonsterObj);
  _.each(motifMonsterObj, function(obj) {
    obj.relativeRank = percentage;
    percentage += rankStep;
  });
  fs.writeFile(destMotifFilePath, JSON.stringify(motifMonsterObj), function(err) {
    if (err) throw err;
    console.log('the file has been saved');
  });
}

function sortByRank(data) {
  return _.sortBy(data, ['absoluteRank']);
}

function init() {
  openMotifs().on('close', function() {
    openArtworks().on('close', function() {
      writeMotifs();
    });
  });
}

init();
