/* main.js */

const express = require('../client/node_modules/express'),
      path    = require('path'),
      app     = express(),
      port    = 9000

app.use(express.static(path.join(__dirname, '../client/dist')))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`)
})

/* main.js */