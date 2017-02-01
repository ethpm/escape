var express = require('express')

var app = express()

const staticRoot = process.env.STATIC_ROOT || 'build'

app.use('/static', express.static('build'))

app.get('/*', function(req, res) {
  res.sendFile('index.html', {root: './build'})
})

const port = process.env.PORT || 8080

app.listen(port, function () {
  console.log('Listening on localhost:' + port)
})
