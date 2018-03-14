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

// manual routing

// ssl ->
app.use('/.well-known', express.static(__dirname + '/.well-known', {dotfiles:'allow'}))

// game ->
app.use('/game', express.static(__dirname + '/game'))
app.get('/game', function(req, res) {
  res.sendFile(__dirname + '/game/game.html');
});

// page ->
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

// ------------

let players = [];

class ServerPlayer { // prototype for server player
  constructor(obj) {
    this.id = obj.id;
    this.x = obj.x;
    this.y = obj.y;
  }
}

function updatePlayers(){ // scan connected sockets and push the connected players to players[]
    players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if (player) players.push(player);
    });
}

io.sockets.on('connection', function(socket) {
  console.log();
  console.log('? CLIENT CONNECTED : ' + socket.handshake.address);


  socket.on('requestplayer', function(plr) { // get ServerPlayer object from client

    plr = new ServerPlayer(plr); // paranoid recast

    // no need to update players as a new player hasn't been added yet

    for (i=0; i<players.length;i++) { // check for existing player
      if (players[i] && players[i].id == plr.id) {
        console.log('? ERROR - player with such name is already in game : ' + plr.id);
        return; // this breaks out of both for and the function
      }
    }

    console.log('? new player accepted : ' + plr.id);

    socket.player = plr; // attach the ServerPlayer object to this connection
    updatePlayers(); // now a new players has been added so update the players

    socket.broadcast.emit('playerconnected', plr) // send the new ServerPlayer to other clients
    socket.emit('allplayers', players) // return all players list to socket

    console.log('#ALL PLAYERS <ServerPlayer> :: '); console.log(players);
  });


  socket.on('disconnect', function() {
    console.log('\n? CLIENT DISCONNECTED : ' + socket.handshake.address + (socket.player ? ' -> player : ' + socket.player.id : ''));

    if(socket.player) {
      io.emit('playerdisconnected', socket.player.id); //
      updatePlayers();
    }
  });

  socket.on('move', function(data) {

    if (socket.player) {

      // send data to update other clients
      socket.broadcast.emit('othermove', {
        id: socket.player.id,
        x: data.x,
        y: data.y
      });

      // update server data
      socket.player.x = data.x;
      socket.player.y = data.y;

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
