const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const fs = require('fs')

const app = express()
const port = 3000 || process.env.PORT
if (!fs.existsSync('leaderboardData.json')) {
    fs.writeFileSync('leaderboadData.json', '[]')
}
const dataFile = JSON.parse(fs.readFileSync('leaderboardData.json'))
const leaderboard = new Map(dataFile)

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')))
app.use(express.json())
app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')

// The start game screen
app.get('/', (req, res) => {
    res.status(200).render('main')
})

// When birdie dies, transmits scores to leaderboard data json
app.put('/died', (req, res) => {
    const data = req.body
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
})

// Leaderboard renderer: top 4 scores
app.get('/leaderboard', function (req, res) {
    const upperBound = Math.min([...leaderboard.entries()].length, 4)
    const highest = [...leaderboard.entries()]
        .sort(([k1,v1],[k2,v2]) => v2 - v1)
        .slice(0,upperBound)
        .map(([name,score]) => ({ name,score }))
    res.status(200).render('./partials/leaderboard', { leaderboardData: highest })
})

// Listener for ports
app.listen(port, () => {
    console.log(`listen to ${port}`)
})

