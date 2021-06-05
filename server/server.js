const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000
var dataFile = JSON.parse(fs.readFileSync('leaderboardData.json'))

const dontGame = true;
// app.get('/build.js', (req,res,next) => {
//   if (dontGame) {
//     res.send(404);
//   } else {
//     next();
//   }
// });


app.use(express.static(path.join(__dirname, '..', 'client', 'dist')))
app.use(express.json());
app.get('/', (req, res, next) => {
    res.sendFile('index.html')
})

const leaderboard = new Map();

app.put('/died', (req, res) => {
    const data = req.body;
    console.log("== req.body:", req.body)
    const { name, altitude } = data;
    leaderboard.set(name, altitude);
    res.send(200);
    console.log(leaderboard.entries());
});

// not sure if this works yet...
app.post('/leaderboard', function (req, res, next) {
    console.log("== req.body:", req.body)
    if (req.body && req.body.username && req.body.altitude) {

        if (leaderboardData) {
            leaderboardData.push({ 
                username: req.body.username,
                score: req.body.altitude
            })
            console.log("== leaderboardData:", leaderboardData)
            fs.writeFile(
                __dirname + 'leaderboardData.json',
                JSON.stringify(leaderboardData, null, 2),
                function (err) {
                    if (err) {
                        res.status(500).send("Error writing new data. Try again later.")
                    } else {
                        res.status(200).send()
                    }
                }
            )
        } else {
            next()
        }
    } else {
        res.status(400).send("Request needs a JSON body with 'url' and 'caption'.")
    }
})

app.listen(port, () => {
    console.log(`listen to ${port}`)
})

/**
 * Sort JSON file by particular key
 * Note: Key is the score/altitude of the birdie once they die
 * @param {int} key JSON key to use
 * @param {Object}
 */ 
 function sortBy(key, data) {
    return data.sort((a, b) => {
        var x = parseInt(a[key]);
        var y = parseInt(b[key]);
        return ((x > y) ? -1 : ((x < y) ? 1 : 0))
    })
}
var sortedData = sortBy('score', dataFile)

