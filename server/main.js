
const db = require('./db');

/**
 * Server side tasks: 
 * - Leaderboard
 * - Avatar selection
 * - Maybe dynamically serve the rules content?
 */

/* Variables and constants */
var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
const MongoClient = require('mongodb').MongoClient;
var app = express();

var portnumber = process.env.PORT || 3000;


app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

/* Creates a table of (name, score) values */
/* Add (photo, name, score) later */
const hashmap = {};
app.route('/postScore', (req,res) => {
  hashmap[req.params.name] = req.params.score;
})

async function main() {
    const database = await MongoClient.connect(url);

    // Start the server
    app.listen(portnumber, function() {
        console.log("Server running on port " + portnumber)
    })

    // GET / - this would normally get the index.html
    app.get('/', function(req, res, next) {


    })
}