const express = require('express')
const { fstat } = require('fs')
const path = require('path')
const app = express()
const port = 3000

const json = JSON.parse(getJsonFile())
const jsonAsArray = Object.keys(json).map(function (key) {
    return json[key];
})
.sort(function (itemA, itemB) {
    return itemA.score < itemB.score
})

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
    if (req.body && req.body.username && req.body.score) {

        if (leaderboardData) {
            leaderboardData.push({ 
                username: req.body.username,
                score: req.body.score
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


