var urlParams = new URLSearchParams(window.location.search);
var bounds;

var seb;
var filip;

var socket = io.connect('https://pmxyt.fr.openode.io', { transports: ['websocket']});

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
    seb.x = mouseX;
    seb.y = mouseY;
    socket.emit('alpha', 'seb:' + seb.x + ':' + seb.y);
  } else if (pname == 'filip') {
    filip.x = mouseX;
    filip.y = mouseY;
    socket.emit('alpha', 'filip:' + filip.x + ':' + filip.y);
  }
}

function setup() {
  bounds  = {
    w: windowWidth-15,
    h: windowHeight-20
  };
  createCanvas(bounds.w, bounds.h);
  bbg();
  frameRate(120);

  seb = new Player(255, 0, 0);
  filip = new Player(0, 255, 0);

  pname = urlParams.get('name');

  socket.on('alpha', function(msg){
    var data = msg.split(':');
    if (data[0] == 'filip' && pname != 'filip') {
      filip.x = parseInt(data[1]);
      filip.y = parseInt(data[2]);
    } else if (data[0] == 'seb' && pname != 'seb') {
      seb.x = parseInt(data[1]);
      seb.y = parseInt(data[2]);
    }
  });

  setInterval(tick, 10);

}

function draw() {
  clear();
  seb.draw();
  filip.draw();
}
