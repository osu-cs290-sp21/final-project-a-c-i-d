/* main.js */

const express = require('../client/node_modules/express')
const path    = require('path')
const app     = express()
const port    = 9000

app.use(express.static(path.join(__dirname, '../client/dist')))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`)
})

/* main.js */
