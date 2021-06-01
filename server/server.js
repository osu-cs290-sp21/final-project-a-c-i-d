const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 9000

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')))

app.get('/', (req, res, next) => {
  res.sendFile('index.html')
})

app.listen(port, () => {
  console.log(`listen to ${port}`)
})
