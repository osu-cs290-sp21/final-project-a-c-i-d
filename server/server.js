const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const db = require('./db');
const ss = require('./safespace');

const app = express()
const port = (process.env.PORT || 5000)

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')))
app.use(express.json())
app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')

// The start game screen
app.get('/', (req, res) => {
    res.status(200).render('main')
})

// When birdie dies, transmits scores to leaderboard data json
app.put('/died', async (req, res) => {
    const data = req.body
    console.log(new Date(), data)
    const { name, altitude } = data
    if (!ss.acceptable(name)) {
        res.sendStatus(403);
        return;
    }
    if (db.has(name)) {
        if (db.get(name) < altitude) {
            await db.set(name, altitude)
        }
    } else {
        await db.set(name, altitude);
    }
    res.sendStatus(200)
})

// Leaderboard renderer: top 4 scores
app.get('/leaderboard', async (req, res) => {
    const entries = db.entries();
    const upperBound = Math.min(entries.length, 4)
    const highest = [...entries]
        .sort(([k1,v1],[k2,v2]) => v2 - v1)
        .slice(0,upperBound)
        .map(([name,score]) => ({ name,score }))
    res.status(200).render('./partials/leaderboard', { leaderboardData: highest })
})

// Listener for ports
db.init().then(() => app.listen(port, () => console.log(`listen to ${port}`)));

