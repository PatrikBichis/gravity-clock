// Benedikt Groß
// Example is based on examples from: http://brm.io/matter-js/, https://github.com/shiffman/p5-matter

const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
var boxes = []; 
var blockDrawing = false;
var inOrientationMode = false;
var _alpha = 0;
var _beta = 0;
var _gamma = 0;

let engine;
let height = 0;
let width = 0;
let ground;
let leftWall;
let rightWall;
let roof;
let angle = 0;
let _frameCount = 0;
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
    // TODO : Chanage size on static objects
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
  //textAlign(CENTER, CENTER);
  textAlign(CENTER, BASELINE );

  // let btnReload = document.querySelector("#btnReload");
  // console.dir(btnReload);
  // btnReload = addEventListener("click", reload);
  // let btnPhone = document.querySelector(".btnPhone");
}

function draw() {
  
  // Set background to black
  background(0);

  // Draw orientation
  if(inOrientationMode){
    fill(255);
    textAlign(LEFT, BASELINE );
    textSize(20);
    text(_alpha+","+_beta+","+_gamma, 100, 50);
    textAlign(CENTER, BASELINE );
  }

  if(!blockDrawing){
    // Add or remove numbers based on time,
    // should be moved to a timer
    addNumbers();
    removeNumbers();

    // Draw all numbers
    for (let i = 0; i < boxes.length; i++) {
      drawRec(boxes[i]);
    }
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

function reload(){
  blockDrawing = true;
  console.log(boxes.length);
  for (let i = 0; i < boxes.length; i++) {
    World.remove(engine.world, boxes[i].body);
  }

  boxes = [];

  seconds = -1;
  _minute = -1;
  _hour = -1;
  blockDrawing = false;
}

function handleOrientation(e){
  inOrientationMode = true;
  _alpha = e.alpha;
  _beta = e.beta;
  _gamma = e.gamma;
  console.log('rotateZ(' + _alpha + 'deg) rotateX(' + _beta + 'deg) rotateY(' + _gamma + 'deg)')
}

function activatePhoneMode(){
  if ( window.DeviceOrientationEvent && typeof( DeviceMotionEvent.requestPermission ) === "function" ) {
    // (optional) Do something before API request prompt.
    DeviceMotionEvent.requestPermission()
        .then( response => {
        // (optional) Do something after API prompt dismissed.
        if ( response == "granted" ) {
          window.addEventListener( "deviceorientation", handleOrientation)
        }
    })
        .catch( console.error )
  } 
  if (window.DeviceOrientationEvent) {
    window.addEventListener( "deviceorientation", handleOrientation)
  }else {
      alert( "DeviceMotionEvent is not defined" );
  }
  
}

function addNumbers() {
  if (_frameCount % 40 == 0) {
    let s = moment().format('ss');
    let m = moment().format('mm');
    let h = moment().format('HH');
    if (seconds !== s) {
      seconds = s;
      addNumber(h, m, s, 1);
    }
    if (_minute !== m) {
      _minute = m;
      addNumber(h, m, s, 2)
    }
    if (_hour !== h) {
      _hour = h;
      addNumber(h, m, s, 3)
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

function addNumber(_hour, _minute, seconds, type){
  let b = createBodyBasedOnType(type);
 
  let a = {
    body: b,
    value: seconds,
    type: type,
    hour: _hour,
    minute: _minute,
    seconds: seconds
  }
  boxes.push(a);
  World.add(engine.world, b);
}

function createBodyBasedOnType(type){
  let x = 80;
  let y = 40;
  let angel = 0.45;

  if(type == 2){
    x = 220;
    y = 100;
    angel = 0.1;
  }
  if(type == 3){
    x = 340;
    y = 160;
    angel = 0.01;
  }
  
  let b = Bodies.rectangle(width/2 - 40, 10, x, y, {
    angle: angle
  });
  Body.setAngularVelocity(b, random(-angel, angel));

  return b;
}

// function addSeconds(_hour, _minute, seconds) {
//   let b = Bodies.rectangle(width/2 - 40, 10, 80, 40, {
//     angle: angle
//   });
//   Body.setAngularVelocity(b, random(-0.45, 0.45));

 
//   let a = {
//     body: b,
//     value: seconds,
//     type: 1,
//     hour: _hour,
//     minute: _minute,
//     seconds: seconds
//   }
//   boxes.push(a);
//   World.add(engine.world, b);
// }

// function addMinute(_hour, _minute, seconds) {
//   let b = Bodies.rectangle(width/2 - 40, 10, 220, 100, {
//     angle: angle
//   });
//   Body.setAngularVelocity(b, random(-0.10, 0.10));

//   World.add(engine.world, b);
//   let a = {
//     body: b,
//     value: _minute,
//     type: 2,
//     hour: _hour,
//     minute: _minute,
//     seconds: seconds
//   }
//   boxes.push(a);
// }

// function addHour(_hour, _minute, seconds) {
//   let b = Bodies.rectangle(width/2 - 40, 10, 340, 160, {
//     angle: angle
//   });
//   Body.setAngularVelocity(b, random(-0.01, 0.01));

//   World.add(engine.world, b);
//   let a = {
//     body: b,
//     value: _hour,
//     type: 3,
//     hour: _hour,
//     minute: _minute,
//     seconds: seconds
//   }
//   boxes.push(a);
// }

function drawRec(number) {
  let body = number.body;
  let type = number.type;
  let color = '#000000';
  let x = 80;
  let y = 40;
  let fontSize = 60;

  if (type === 1) {
    color = '#FFFFFF';
    x = 80;
    y = 40;
    fontSize = 60;
  } else if (type === 2) {
    color = '#65FDF0';
    x = 220;
    y = 100;
    fontSize = 156;
  } else if (type === 3) {
    color = '#1D6FA3';
    x = 340;
    y = 160;
    fontSize = 248;
  }

  if(showStroke){
    fill(255);
    drawVertices(body.vertices);
    stroke('#FF0000')
  }else noStroke();

  push();
  translate(body.position.x, body.position.y)
  rotate(body.angle);
  translate(-(x/2), -(y/2));
  noFill();
  rect(0, 0, x, y);
  translate((x/2), (y/2));
  fill(color);
  textSize(fontSize);
  text(number.value, 0, y/2-(y*0.01));
  pop();
}

// function drawBody(body) {
//   if (body.parts && body.parts.length > 1) {
//     for (let p = 1; p < body.parts.length; p++) {
//       drawVertices(body.parts[p].vertices)
//     }
//   } else {
//     drawVertices(body.vertices);
//   }
// }