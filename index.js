var express = require('express')

var app = express()

const staticRoot = process.env.STATIC_ROOT || 'build'

app.use('/static', express.static(staticRoot))

const LETS_ENCRYPT_SECRET_PATH = process.env.LETS_ENCRYPT_SECRET_PATH
const LETS_ENCRYPT_SECRET = process.env.LETS_ENCRYPT_SECRET

if (LETS_ENCRYPT_SECRET !== undefined && LETS_ENCRYPT_SECRET_PATH != undefined) {
  app.get('/.well-known/acme-challenge/' + LETS_ENCRYPT_SECRET_PATH, function(req, res) {
    res.send(LETS_ENCRYPT_SECRET)
  })
}

app.get('/*', function(req, res) {
  res.sendFile('index.html', {root: './' + staticRoot})
})

const port = process.env.PORT || 8080

app.listen(port, function () {
  console.log('Listening on localhost:' + port)
})
