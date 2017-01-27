var express = require('express')

var app = express()

app.use('/static', express.static('build'))

app.get('/*', function(req, res) {
  res.sendfile('index.html', {root: './build'})
})

const port = process.env.PORT || 8080

app.listen(port, function () {
  console.log('Listening on localhost:' + port)
})
