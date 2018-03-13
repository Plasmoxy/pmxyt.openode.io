let urlParams = new URLSearchParams(window.location.search);

let seb;
let filip;

let socket = io.connect('https://pmxyt.fr.openode.io', { transports: ['websocket']});

function Player(red, green, blue) {
  this.x = 0;
  this.y = 0;
  this.draw = function() {
    fill(red, green, blue);
    ellipse(this.x, this.y, 30, 30);
  };
}

function bbg() {
  background(16, 16, 16);
}

function tick() {
  if (pname == 'seb') {
    socket.emit('alpha', 'seb:' + seb.x + ':' + seb.y);
  } else if (pname == 'filip') {
    socket.emit('alpha', 'filip:' + filip.x + ':' + filip.y);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  bbg();
  frameRate(120);

  seb = new Player(255, 0, 0);
  filip = new Player(0, 255, 0);

  pname = urlParams.get('name');

  socket.on('alpha', function(msg){
    let data = msg.split(':');
    if (data[0] == 'filip' && pname != 'filip') {
      filip.x = parseInt(data[1]);
      filip.y = parseInt(data[2]);
    } else if (data[0] == 'seb' && pname != 'seb') {
      seb.x = parseInt(data[1]);
      seb.y = parseInt(data[2]);
    }
  });

}

let dt, newtime = 0;
let oldtime = Date.now();

function draw() {
  newtime = Date.now();
  dt = newtime - oldtime;

  if (dt > 30) {
    oldtime = newtime;
    tick();
  }

  if (pname == 'seb') {
    seb.x = mouseX;
    seb.y = mouseY;
  } else if (pname == 'filip') {
    filip.x = mouseX;
    filip.y = mouseY;
  }

  clear();
  seb.draw();
  filip.draw();
}
