var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var socketio = require('socket.io');

var ssl_options = {
  key: fs.readFileSync('ssl/private.key'),
  cert: fs.readFileSync('ssl/certificate.crt'),
  ca: fs.readFileSync('ssl/ca_bundle.crt')
};

app = express();
redirectApp = express();

// redirect from http
var redirectServer = http.createServer(redirectApp);
var server = https.createServer(ssl_options, app);
var io = socketio.listen(server);

// redirect all http requests to https
redirectApp.get('*', function (req, res, next) {
  !req.secure ? res.redirect('https://pmxyt.fr.openode.io' + req.url) : next();
})

// routing
app.use('/.well-known', express.static(__dirname + '/.well-known', {dotfiles:'allow'}))

app.use('/game', express.static(__dirname + '/game'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/game/game.html')
})

// custom

var players = 0;

io.sockets.on('connection', function(client) {
  client.on('INFO', function(msg) {
    if (msg == "addPlayer") {
      client.emit('INFO_RETURN', ''+players);
      players++;
    }
  })
  client.on('alpha', function(msg) {
    client.emit('beta', msg);
  })
  client.on('beta', function(msg) {
    client.emit('alpha', msg);
  })
});

// start servers

server.listen(443, function() {
  console.log('https server listening on port 443')
})
redirectServer.listen(80, function() {
  console.log('redirect http server listening on port 80')
})
