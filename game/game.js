const GAME_SITE = 'https://localhost';

let urlParams = new URLSearchParams(window.location.search);

let socket;
let player;
let name;
let others = [];

class Player {

  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.color = [255, 0, 0];
  }

  draw() {
    fill(this.color[0], this.color[1], this.color[2]);
    ellipse(this.x, this.y, 30, 30);
  };
}

class ServerPlayer {
  constructor(plr) {
    this.id = plr.id;
    this.x = plr.x;
    this.y = plr.y;
  }
}

function bbg() {
  background(16, 16, 16);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  bbg();
  frameRate(60);

  if (urlParams.has('name')) {
    name = urlParams.get('name');
  } else {
    console.log('ERROR: NO NAME PARAM SPECIFIED');
    return;
  }

  player = new Player(name, 100, 100);
  player.color = [255, 0, 0];

  console.log('CONNECTING TO GAME SERVER');
  socket = io.connect(GAME_SITE, { transports: ['websocket']});

  console.log('requesting player creation : ' + name);

  socket.emit('playerconnected', new ServerPlayer(player));

  socket.on('allplayers', function(ps) {
    console.log(':: ALL SERVERPLAYERS ::');
    console.log(ps.slice()); // as for console async, copy a new array ref for console log


    ps.forEach(function(p,i) {
      if (p.id == name) ps.splice(i, 1);
    });

    ps.forEach(function(p,i) {
      others.push(new Player(p.id, p.x, p.y));
    });

    console.log(':: OTHERS CLIENTPLAYERS ::');
    console.log(others);

  });

  socket.on('playerconnected', function(plr) {
    // ANOTHER PLAYER !
    console.log('>>> a player has CONNECTED : ' + plr.id);

    others.push(new Player(plr.id, plr.x, plr.y));

    console.log(':: OTHERS CLIENTPLAYERS ::');
    console.log(others);
  });

  socket.on('playerdisconnected', function(id) {
    console.log('>>> a player has DISCONNECTED : ' + id);

    others.forEach(function(p,i) {
      if (p.id == id) others.splice(i, 1);
    });

    console.log(':: OTHERS CLIENTPLAYERS ::');
    console.log(others);
  });

}

let dt, newtime = 0;
let oldtime = Date.now();

function draw() {
  clear();
  newtime = Date.now();
  dt = newtime - oldtime;

  if (dt > 33) { // 30 hz
    oldtime = newtime;
    tick();
  }

  player.x = mouseX;
  player.y = mouseY;

  if (player) player.draw();

  others.forEach(function(p,i) {
    p.draw();
  });

}

function tick() {

}
