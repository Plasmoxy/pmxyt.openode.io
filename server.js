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

// ------------

let players = [];

class ServerPlayer {
  constructor(id, x, y) {
    this.id = id;
    this.x = 0;
    this.y = 0;
  }
}

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if (player) players.push(player);
    });
    return players;
}

function updatePlayers() {
  players = getAllPlayers();
}

io.sockets.on('connection', function(socket) {
  console.log();
  console.log('? CLIENT CONNECTED : ' + socket.handshake.address);


  socket.on('playerconnected', function(plr) {

    let ingame;
    getAllPlayers().forEach(function(p,i) { // check for existing player
      if (p && p.id == plr.id) {
        console.log('? ERROR - player already in game : ' + plr.id);
        ingame = true;
      }
    });
    if (ingame) return;

    console.log('? new player accepted : ' + plr.id);

    socket.player = plr;

    socket.broadcast.emit('playerconnected', socket.player) // send info to clients that someone connected <just info ?? >

    updatePlayers();

    socket.emit('allplayers', players) // return players list to socket

    console.log('#PLAYERS :: '); console.log(players);
  });


  socket.on('disconnect', function() {
    console.log('\n? CLIENT DISCONNECTED : ' + socket.handshake.address + (socket.player ? ' -> player : ' + socket.player.id : ''));

    if(socket.player) {
      io.emit('playerdisconnected', socket.player.id);
      updatePlayers();
    }
  });

  

});

// start servers

server.listen(443, function() {
  console.log('https server listening on port 443')
})
redirectServer.listen(80, function() {
  console.log('redirect http server listening on port 80')
})
