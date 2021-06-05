const express = require('express')
const fs = require('fs')
const path = require('path')
const exphbs = require('express-handlebars')
const app = express()
const port = 3000
const dataFile = JSON.parse(fs.readFileSync('leaderboardData.json'))
const leaderboard = new Map(dataFile);

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
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


app.get('/', (req, res) => {
    // res.render('main');
    res.status(200).render('main')
})

app.put('/died', (req, res) => {
    const data = req.body;
    console.log("== req.body:", req.body)
    const { name, altitude } = data;
    if (leaderboard.has(name)) {
        if (leaderboard.get(name) < altitude) {
            leaderboard.set(name, altitude);
        }
    } else {
        leaderboard.set(name, altitude);
    }
    fs.writeFileSync('leaderboardData.json', JSON.stringify([...leaderboard.entries()]))
    res.send(200);
    console.log(leaderboard.entries());
});


// not sure if this works yet...
app.get('/leaderboard', function (req, res) {
    const upperBound = Math.min([...leaderboard.entries()].length, 4)
    const highest = [...leaderboard.entries()].sort(([k1,v1],[k2,v2]) => v2 - v1).slice(0,upperBound).map(([name,score]) => ({ name,score }))
    console.log(highest)
    res.status(200).render('./partials/leaderboardModal', { leaderboardData: highest })
    // for (const [key,value] of leaderboard.entries()) {
    //     const name = key
    //     const score = value
    // }

    // console.log("== req.body:", req.body)
    // if (req.body && req.body.username && req.body.altitude) {

    //     if (leaderboardData) {
    //         leaderboardData.push({ 
    //             username: req.body.username,
    //             score: req.body.altitude
    //         })
    //         console.log("== leaderboardData:", leaderboardData)
    //         fs.writeFile(
    //             __dirname + 'leaderboardData.json',
    //             JSON.stringify(leaderboardData, null, 2),
    //             function (err) {
    //                 if (err) {
    //                     res.status(500).send("Error writing new data. Try again later.")
    //                 } else {
    //                     res.status(200).send()
    //                 }
    //             }
    //         )
    //     } else {
    //         next()
    //     }
    // } else {
    //     res.status(400).send("Request needs a JSON body with 'url' and 'caption'.")
    // }
})

app.listen(port, () => {
    console.log(`listen to ${port}`)
    // setInterval(save, 10*1000);
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



// function save() {
//     fs.writeFileSync('leaderboardData.json', JSON.stringify([...leaderboard.entries()]))
// }