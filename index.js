const { createReadStream } = require('fs');
const { join } = require('path');

const cuid = require('cuid');
const level = require('level');
const db = level('./db');

const url = join(__dirname, 'data', 'planets.csv');
const importStream = createReadStream(url);

const getPlanetData = (labels, data) => {
  return {
    id: cuid.slug(),
    name: data[labels['P. Name']],
    mass: parseFloat(data[labels['P. Mass (EU)']]), 
    radius: parseFloat(data[labels['P. Radius (EU)']])
  }
};

const getStellarData = (labels, data) => {
  return {
    id: cuid.slug(),
    name: data[labels['S. Name']]
  }
};

let labels;
const getLabels = (line, data) => {
  if (line === 0) {
    labels = data.reduce((memo, key, i) => {
      memo[key] = i;
      return memo;
    }, {});      
  }
  return labels;
};

let line = 0;
let results = [];

importStream.setEncoding('utf8');

importStream.on('data', chunks => {
  const rows = chunks.split('\n');
  rows.forEach(row => {
    const data = row.split(',');
    const labels = getLabels(line, data);
    const star = getStellarData(labels, data);
    const planet = getPlanetData(labels, data);
    if (line !== 0) {
      db.put(star.id, star).then(result => console.log(result));
    }
    line++;
  }); 
});

importStream.on('end', () => {
  console.log(labels);
  // console.log(results);
});

importStream.read();
