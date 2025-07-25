
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function getFilePath(file) {
  return path.join(DATA_DIR, file);
}

function getDb(file) {
  try {
    return JSON.parse(fs.readFileSync(getFilePath(file), 'utf8'));
  } catch (err) {
    return [];
  }
}

function saveDb(file, data) {
  fs.writeFileSync(getFilePath(file), JSON.stringify(data, null, 2));
}

module.exports = { getDb, saveDb };
