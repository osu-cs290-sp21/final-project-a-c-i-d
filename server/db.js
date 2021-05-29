const fs = require('fs');

let databaseFile = null;

function load(path) {
    databaseFile = path;
    const dataFile = fs.readFileSync(path, 'utf8');
    return JSON.parse(dataFile);
}

function save(data) {
    const dataSave = JSON.stringify(data);
    if (!databaseFile) throw 'No database file has been loaded!';
    fs.writeFileSync(databaseFile, data);
}

module.exports = { load, save };