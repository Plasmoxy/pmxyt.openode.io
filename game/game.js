
var bounds;
var mainPlayer;
var p2;

var socket = io.connect('https://pmxyt.fr.openode.io', { transports: ['websocket']});

function Player() {
  this.x = 0;
  this.y = 0;
  this.draw = function() {
    ellipse(this.x, this.y, 30, 30);
  };
}

function bbg() {
  background(16, 16, 16);
}

function setup() {
  bounds  = {
    w: windowWidth-15,
    h: windowHeight-20
  };
  createCanvas(bounds.w, bounds.h);
  bbg();
  frameRate(60);

  mainPlayer = new Player();
  socket.on('INFO_RETURN', function(msg){
    console.log(msg);
  });
  p2 = new Player();

  socket.on('INFO_RETURN', function(msg){
    console.log(msg);
  });

}

function draw() {
  clear();
  mainPlayer.x = mouseX;
  mainPlayer.y = mouseY;
  mainPlayer.draw();
  p2.draw();
}
