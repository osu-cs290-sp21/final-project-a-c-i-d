const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const fs = require('fs')

const app = express()
const port = 3000 || process.env.PORT

const dataFile = JSON.parse(fs.readFileSync('leaderboardData.json'))
const leaderboard = new Map(dataFile)


const dontGame = true
// app.get('/build.js', (req,res,next) => {
//   if (dontGame) {
//     res.send(404)
//   } else {
//     next()
//   }
// })


app.use(express.static(path.join(__dirname, '..', 'client', 'dist')))
app.use(express.json())
app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')


app.get('/', (req, res) => {
    res.status(200).render('main')
})


app.put('/died', (req, res) => {
    const data = req.body
    console.log("== req.body:", req.body)
    const { name, altitude } = data
    if (leaderboard.has(name)) {
        if (leaderboard.get(name) < altitude) {
            leaderboard.set(name, altitude)
        }
    } else {
        leaderboard.set(name, altitude)
    }
    fs.writeFileSync('leaderboardData.json', JSON.stringify([...leaderboard.entries()]))
    res.send(200)
    console.log("== Entire leaderboard: " + leaderboard.entries())
})


app.get('/leaderboard', function (req, res) {
    const upperBound = Math.min([...leaderboard.entries()].length, 4)
    const highest = [...leaderboard.entries()]
        .sort(([k1,v1],[k2,v2]) => v2 - v1)
        .slice(0,upperBound)
        .map(([name,score]) => ({ name,score }))
    res.status(200).render('./partials/leaderboard', { leaderboardData: highest })
    console.log("== Top 4: " + highest)
})


app.listen(port, () => {
    console.log(`listen to ${port}`)
    // setInterval(save, 10*1000)
})


/**
 * Sort JSON file by particular key
 * Note: Key is the score/altitude of the birdie once they die
 * @param {int} key JSON key to use
 * @param {Object}
 */

//  function sortBy(key, data) {
//     return data.sort((a, b) => {
//         var x = parseInt(a[key])
//         var y = parseInt(b[key])
//         return ((x > y) ? -1 : ((x < y) ? 1 : 0))
//     })
// }
// var sortedData = sortBy('score', dataFile)

// function save() {
//     fs.writeFileSync('leaderboardData.json', JSON.stringify([...leaderboard.entries()]))
// }

