// Benedikt Groß
// Example is based on examples from: http://brm.io/matter-js/, https://github.com/shiffman/p5-matter

const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
var once = false;


let engine;

let height = 0;
let width = 0;

let ground;
let leftWall;
let rightWall;
let roof;
let angle = 0;
let _frameCount = 0;
var boxes = []; 
let seconds = -1;
let _minute = -1;
let _hour = -1;
let showStroke = false;

let font;

function preload() {
  font = loadFont('fonts/InconsolataExtraExpanded-Bold.ttf');
  window.addEventListener('resize', reportWindowSize);
}

function reportWindowSize(e){
    height = window.innerHeight;
    width = window.innerWidth;
    resizeCanvas(width, height);
}

function setup() {
  height = window.innerHeight;
  width = window.innerWidth;
  createCanvas(width, height);

  // create an engine
  engine = Engine.create();

  // create static objects
  ground = Bodies.rectangle(width/2, height, width + 10, 10, {
    isStatic: true,
    angle: 0
  });
  leftWall = Bodies.rectangle(0, height/2, 10, height + 10, {
    isStatic: true,
    angle: 0
  });
  rightWall = Bodies.rectangle(width, height/2, 10, height + 10, {
    isStatic: true,
    angle: 0
  });
  roof = Bodies.rectangle(width/2, 0, width + 10, 10, {
    isStatic: true,
    angle: 0 
  });

  // add all of the bodies to the world
  World.add(engine.world, [ground, leftWall, rightWall, roof]);

  // set gravity 
  engine.world.gravity.x = 0;
  engine.world.gravity.y = 1;

  // run the engine
  Engine.run(engine);

  // set font and how text should align
  textFont(font)
  textAlign(CENTER, CENTER);
}

function draw() {
  // Set background to black
  background(0);

  // Add or remove numbers based on time,
  // should be moved to a timer
  addNumbers();
  removeNumbers();

  // Draw all numbers
  for (let i = 0; i < boxes.length; i++) {
    drawRec(boxes[i]);
  }

  // Draw static objects with black 
  fill(0);
  drawVertices(ground.vertices);
  drawVertices(leftWall.vertices);
  drawVertices(rightWall.vertices);
  drawVertices(roof.vertices);

  // Update frame count, should be removed 
  // when add and remove of numbers is moved.
  _frameCount++;
}

function addNumbers() {
  if (_frameCount % 40 == 0) {
    let s = moment().format('ss');
    let m = moment().format('mm');
    let h = moment().format('HH');
    if (seconds !== s) {
      seconds = s;
      addSeconds(h, m, s);
    }
    if (_minute !== m) {
      _minute = m;
      addMinute(h, m, s)
    }
    if (_hour !== h) {
      _hour = h;
      addHour(h, m, s)
    }
    _frameCount = 0;
  }
}

function removeNumbers() {
  let now = moment();

  for (let i = 0; i < boxes.length; i++) {
    let then = moment(boxes[i].hour + ":" + boxes[i].minute + ":" + boxes[i].seconds, 'HH:mm:ss');
    let m = moment().format('mm');
    let h = moment().format('HH');

    var duration = moment.duration(now.diff(then));


    if (boxes[i].type == 1 && duration._data.minutes > 1) {
      World.remove(engine.world, boxes[i].body);
      boxes.splice(i, 1);
    }

    if (boxes[i].minute === undefined) {
      print("Error");
      print(boxes[i]);
      noLoop();
    }

    if (boxes[i].minute !== undefined && boxes[i].minute !== m && boxes[i].type == 2) {

      World.remove(engine.world, boxes[i].body);
      boxes.splice(i, 1);
    }

    if (boxes[i].hour !== h && boxes[i].type == 3) {
      World.remove(engine.world, boxes[i].body);
      boxes.splice(i, 1);
    }
  }
}

function drawVertices(vertices) {
  beginShape();
  for (let i = 0; i < vertices.length; i++) {
    vertex(vertices[i].x, vertices[i].y);
  }
  endShape(CLOSE);
}

function addSeconds(_hour, _minute, seconds) {
  let b = Bodies.rectangle(width/2 - 40, 10, 80, 40, {
    angle: angle
  });
  Body.setAngularVelocity(b, random(-0.45, 0.45));

  World.add(engine.world, b);
  let a = {
    body: b,
    value: seconds,
    type: 1,
    hour: _hour,
    minute: _minute,
    seconds: seconds
  }
  boxes.push(a);
}

function addMinute(_hour, _minute, seconds) {
  let b = Bodies.rectangle(width/2 - 40, 10, 220, 100, {
    angle: angle
  });
  Body.setAngularVelocity(b, random(-0.10, 0.10));

  World.add(engine.world, b);
  let a = {
    body: b,
    value: _minute,
    type: 2,
    hour: _hour,
    minute: _minute,
    seconds: seconds
  }
  boxes.push(a);
}

function addHour(_hour, _minute, seconds) {
  let b = Bodies.rectangle(width/2 - 40, 10, 340, 160, {
    angle: angle
  });
  Body.setAngularVelocity(b, random(-0.01, 0.01));

  World.add(engine.world, b);
  let a = {
    body: b,
    value: _hour,
    type: 3,
    hour: _hour,
    minute: _minute,
    seconds: seconds
  }
  boxes.push(a);
}

function drawRec(number) {
  //console.dir(number)
  let body = number.body;
  let type = number.type;
  let c = color(255, 0, 0);
  push();
  translate(body.position.x, body.position.y)
  rotate(body.angle);

  if (type === 1) {
    translate(-40, -20)
    noFill();
    showStroke ? stroke(c) : noStroke();
    rect(0, 0, 80, 40);
    fill(255);
    textSize(60);
    text(number.value, 40, 12);
  } else if (type === 2) {
    translate(-105, -50)
    noFill();
    showStroke ? stroke(c) : noStroke();
    rect(0, 0, 210, 100);
    fill('#65FDF0');
    textSize(150);
    text(number.value, 105, 32)
  } else if (type === 3) {
    translate(-170, -80)
    noFill();
    showStroke ? stroke(c) : noStroke();
    rect(0, 0, 340, 160);
    fill('#1D6FA3');
    textSize(240);
    text(number.value, 170, 52);
  }
  pop();
}

function drawBody(body) {
  if (body.parts && body.parts.length > 1) {
    for (let p = 1; p < body.parts.length; p++) {
      drawVertices(body.parts[p].vertices)
    }
  } else {
    drawVertices(body.vertices);
  }
}