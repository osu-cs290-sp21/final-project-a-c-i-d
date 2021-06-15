const Filter = require('bad-words');
const filter = new Filter();

function acceptable(name) {
    return !filter.isProfane(name) && name.length < 25;
}

module.exports = { acceptable };