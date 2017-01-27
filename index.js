var express = require('express')

var app = express()

app.use('/static', express.static('build'))

app.get('/*', function(req, res) {
  res.sendfile('index.html', {root: './build'})
})

app.listen(8080, function () {
  console.log('Listening on localhost:8080')
})
