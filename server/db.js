const fs = require('fs');

let databaseFile = null;

function load(path) {
    databaseFile = path;
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
}

function save(data) {
    const data = JSON.stringify(data);
    if (!databaseFile) throw 'No database file has been loaded!';
    fs.writeFileSync(databaseFile, data);
}

module.exports = { load, save };