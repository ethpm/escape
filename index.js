var express = require('express')

var app = express()

const USE_SSL = process.env.USE_SSL

if (USE_SSL !== undefined) {
  // Enable reverse proxy support in Express. This causes the
  // the "X-Forwarded-Proto" header field to be trusted so its
  // value can be used to determine the protocol. See 
  // http://expressjs.com/api#app-settings for more details.
  app.enable('trust proxy')

  // Add a handler to inspect the req.secure flag (see
  // http://expressjs.com/api#req.secure). This allows us 
  // to know whether the request was via http or https.
  app.use (function (req, res, next) {
    if (req.secure) {
      // request was via https, so do no special handling
      next()
    } else {
      // request was via http, so redirect to https
      res.redirect('https://' + req.headers.host + req.url)
    }
  })
}

const staticRoot = process.env.STATIC_ROOT || 'build'

app.use('/static', express.static(staticRoot))

const LETS_ENCRYPT_SECRET_PATH = process.env.LETS_ENCRYPT_SECRET_PATH
const LETS_ENCRYPT_SECRET = process.env.LETS_ENCRYPT_SECRET

if (LETS_ENCRYPT_SECRET !== undefined && LETS_ENCRYPT_SECRET_PATH !== undefined) {
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
