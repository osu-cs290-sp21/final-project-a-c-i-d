/**
 * Server side tasks: 
 * - Leaderboard
 * - Avatar selection
 * - Maybe dynamically serve the rules content?
 */

/* Variables and constants */
const db = require('./db');
const fs = require('fs');
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();

var portnumber = process.env.PORT || 9000;


app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

/* Creates a table of (name, score) values */
/* Add (photo, name, score) later */
const hashmap = {};
app.route('/postScore', (req,res) => {
  hashmap[req.params.name] = req.params.score;
})

//async function main() {

    app.use(express.static(path.join(__dirname, '/../client/dist')));

    


    // GET / - this would normally get the home page
    app.get('/', (req, res, next) => {
      res.send("Hello from the express server!")
    })

    app.get('*', (req, res, next) => {
      console.log("== 404!!")
      
    })


    // Start the server
    app.listen(portnumber, () => {
      console.log("== Server running on port " + portnumber)
    })

//}

//main();