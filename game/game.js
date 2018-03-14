const GAME_SITE = '/';
const DEBUG = true;

function debug(obj) {
  DEBUG && console.log(obj);
}

let urlParams = new URLSearchParams(window.location.search);

let socket;
let player;
let name;
let others = [];


class ServerPlayer { // prototype for server player
  constructor(obj) {
    this.x = obj.x;
    this.y = obj.y;
    this.id = obj.id;
  }
}

class Player extends ServerPlayer {

  constructor(obj) {
    super(obj);
    this.color = [255, 255, 0]; // default -> blue
  }

  draw() {
    fill(this.color[0], this.color[1], this.color[2]);
    ellipse(this.x, this.y, 30, 30);
  };
}


function setup() {

  // setup p5
  createCanvas(windowWidth, windowHeight);
  background(16, 16, 16);
  frameRate(60);

  // detect url params TODO -> name is a debug
  if (urlParams.has('name')) {
    name = urlParams.get('name');
  } else {
    console.log('ERROR: NO NAME URL PARAM SPECIFIED');
    return;
  }

  // create THIS player
  debug(':: CREATING PLAYER ::');
  player = new Player({
    id: name,
    x: 100,
    y: 100
  });
  player.color = [0, 255, 255];
  debug(' CREATED -> ' + player.id + '\n');

  // connect to server, the socket objects is unique connection identificator, it represents the real identity of THIS player
  console.log('Connecting to game server -> ' + window.location.href);
  socket = io.connect(GAME_SITE, { transports: ['websocket']});

  // request player
  console.log('Requesting player creation : ' + name);
  socket.emit('requestplayer', new ServerPlayer(player)); // cast a serverplayer and send it to server

  // on ( get all server players )
  socket.on('allplayers', function(s_players) { // ps -> array of ServerPlayer

    console.log('\nCONNECTED -> RETRIEVING PLAYERS');

    debug(':: ALL PLAYERS ON SERVER <ServerPlayer> ::');
    debug(s_players.slice()); // as for console async, copy a new array for console log

    // remove THIS player from array (we need only others)
    s_players.forEach(function(sp,i) {
      if (sp.id == name) s_players.splice(i, 1);
    });

    // cast every ServerPlayer to player so they can do stuff
    s_players.forEach(function(sp,i) {
      others.push(new Player(sp));
    });

    debug(':: OTHER PLAYERS HERE <Player> ::');
    debug(others.slice());

    console.log('PLAYERS LOADED\n');

  });

  socket.on('playerconnected', function(plr) {
    // ANOTHER PLAYER !
    console.log('>>> a player has CONNECTED : ' + plr.id);

    others.push(new Player(plr));

    debug(':: OTHER PLAYERS HERE ::');
    debug(others.slice());
  });

  socket.on('playerdisconnected', function(id) {
    console.log('>>> a player has DISCONNECTED : ' + id);

    others.forEach(function(p,i) { // remove player with that id
      if (p.id == id) others.splice(i, 1);
    });

    debug(':: OTHER PLAYERS HERE (after disconnect) ::');
    debug(others.slice());
  });

  socket.on('othermove', function(movedata) {
    for (i = 0; i < others.length; i++) {
      if (others[i].id == movedata.id) {
        others[i].x = movedata.x;
        others[i].y = movedata.y;
        return; // pop the function as we don't need to iterate to remaining players
      }
    }
  });

}

let dt, newtime = 0;
let oldtime = Date.now();

function draw() {
  clear();
  newtime = Date.now();
  dt = newtime - oldtime;

  if (dt > 16) { // 30 hz tick
    oldtime = newtime;
    tick();
  }

  player.x = mouseX;
  player.y = mouseY;

  player.draw();

  others.forEach(function(p,i) {
    p.draw();
  });

}

function tick() {
    socket.emit('move', { x: player.x, y: player.y });
}
