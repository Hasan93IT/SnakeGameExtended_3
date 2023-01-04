/* global THREE */

import * as THREE from 'https://unpkg.com/three@0.129.0/build/three.module.js' 
// * Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setClearColor('rgb(255,255,255)');
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
//renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -20, 7);
scene.add(camera);

// scene.add(new THREE.AxesHelper(5));
scene.add(new THREE.AmbientLight(0XFFFFFF));
camera.lookAt(scene.position);
const light = new THREE.SpotLight(0XFFFFFF);
scene.add(light);
light.position.set(20, 20, 40);
light.intensity = 0.3;
light.castShadow = true;
// shadow resolution 
light.shadow.mapSize.width = 8000;
light.shadow.mapSize.height = 8000;
light.penumbra = 1;


let txtLoader = new THREE.TextureLoader();
// all colors of the clock
const colors = {
  Clock: 0XFFFFFF,
  Ground: 0xaaaaaa,
  DisplayBoard: 'black'
};

const groundRadius = 50
function createground() {

  const geometryground = new THREE.CircleGeometry(groundRadius, 32);
  const materialground = new THREE.MeshPhongMaterial({ color: colors.Ground });
  const ground = new THREE.Mesh(geometryground, materialground);
  ground.receiveShadow = true;
  scene.add(ground);
}
createground();

function createSky() {
  const urls = [
    "resources/skybox/px.jpg",
    "resources/skybox/nx.jpg",
    "resources/skybox/py.jpg",
    "resources/skybox/ny.jpg",
    "resources/skybox/pz.jpg",
    "resources/skybox/nz.jpg",
  ];
  //The X axis is red. The Y axis is green. The Z axis is blue.
  let matArray = [];
  urls.forEach(tn => {
    const txtSky = txtLoader.load(tn);
    matArray.push(new THREE.MeshBasicMaterial({
      map: txtSky,
      side: THREE.DoubleSide
    }))
  });
  const skyScale = 800;
  const skyBoxGeo = new THREE.BoxGeometry(skyScale, skyScale, skyScale);
  const skyBox = new THREE.Mesh(skyBoxGeo, matArray);
  skyBox.rotation.x = Math.PI / 2;
  scene.add(skyBox);
}
createSky();

const wallsGeometry = {
  wallWidth: 1,
  wallLong: 12.1,
  wallDeep: 0.1,
};
const wallsPosition = {
  frameLongX: 6.06,
  frameLongY: 0,
  frameShortX: 0,
  frameShortY: 6.06,
  frameZ: 0.5,
};

function createWalls() {
  const Walls = new THREE.Group();
  // freames
  const texturediffuse = txtLoader.load('resources/hardwood2_diffuse.jpg');
  const texturebump = txtLoader.load('resources/hardwood2_bump.jpg');
  texturebump.wrapS = THREE.RepeatWrapping;
  texturebump.wrapT = THREE.RepeatWrapping;
  texturebump.repeat.set(0, 1);

  texturediffuse.wrapS = THREE.RepeatWrapping;
  texturediffuse.wrapT = THREE.RepeatWrapping;
  texturediffuse.repeat.set(4, 1);
  // immediately use the texture for material creation
  const materialTable = new THREE.MeshPhongMaterial({ map: texturediffuse, bumpMap: texturebump })

  //create table walls
  for (let i = 0; i < 2; i++) {
    let minusl = -1;
    if (i == 1) {
      minusl = minusl * -1;
    }
    const geometrywidth = new THREE.BoxGeometry(wallsGeometry.wallLong, wallsGeometry.wallDeep, wallsGeometry.wallWidth);

    const wallsRightLeft = new THREE.Mesh(geometrywidth, materialTable);
    const wallsUpdown = new THREE.Mesh(geometrywidth, materialTable);
    wallsRightLeft.rotation.z = Math.PI / 2;

    wallsRightLeft.position.set(wallsPosition.frameLongX * minusl, wallsPosition.frameLongY, wallsPosition.frameZ);
    wallsUpdown.position.set(wallsPosition.frameShortX, wallsPosition.frameShortY * minusl, wallsPosition.frameZ);
    //enable shadow

    wallsRightLeft.receiveShadow = true;
    wallsUpdown.receiveShadow = true;
    wallsUpdown.castShadow = true;
    wallsRightLeft.castShadow = true;

    Walls.add(wallsRightLeft, wallsUpdown);
    scene.add(Walls);

  }
} createWalls();

// grid game
const PlayingFieldSize = 12;
const divisions = 12;

function createPlayingField() {

  const groundNDiffuse = txtLoader.load("resources/FloorsCheckerboard_S_Diffuse.jpg");
  groundNDiffuse.wrapS = THREE.RepeatWrapping;
  groundNDiffuse.wrapT = THREE.RepeatWrapping;
  groundNDiffuse.repeat.set(2, 2);
  groundNDiffuse.anisotropy = 0;

  const groundNormalMap = txtLoader.load("resources/FloorsCheckerboard_S_Normal.jpg");
  groundNormalMap.wrapS = THREE.RepeatWrapping;
  groundNormalMap.wrapT = THREE.RepeatWrapping;
  groundNormalMap.repeat.set(2, 2);

  const geometryPlan = new THREE.PlaneGeometry(PlayingFieldSize, divisions);
  const materialPlan = new THREE.MeshPhongMaterial({  side: THREE.DoubleSide,map: groundNDiffuse, normalMap: groundNormalMap })
  const PlayingField = new THREE.Mesh(geometryPlan, materialPlan);
  PlayingField.castShadow = true;
  PlayingField.receiveShadow = true;
  PlayingField.position.set(0, 0, .01)
  scene.add(PlayingField);

} createPlayingField();

// Variables
const RandomNumber = {
  Min: -(PlayingFieldSize / 2 - 1),
  Max: (PlayingFieldSize / 2 - 1)
};
const cubeShift = -0.5;
const foodShiftZ = 0.35;
const cubeshiftZ = 0.3;
const randomX_cube = randomNumberMinMax(RandomNumber.Min, RandomNumber.Max);
const randomY_cube = randomNumberMinMax(RandomNumber.Min, RandomNumber.Max);

const randomNumberX_food = randomNumberMinMax(RandomNumber.Min, RandomNumber.Max) + cubeShift;
const randomNumberY_food = randomNumberMinMax(RandomNumber.Min, RandomNumber.Max) + cubeShift;
const SnakeBody = new Deque();



function createBoxWithRoundedEdges(width1, height, depth, radius0, smoothness) {
  let shape1 = new THREE.Shape();
  let eps = 0.00001;
  let radius = radius0 - eps;
  shape1.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
  shape1.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
  shape1.absarc(width1 - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
  shape1.absarc(width1 - radius * 2, eps, eps, 0, -Math.PI / 2, true);
  let geometry = new THREE.ExtrudeBufferGeometry(shape1, {
    amount: depth - radius0 * 2,
    bevelEnabled: true,
    bevelSegments: smoothness * 2,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius0,
    curveSegments: smoothness
  });

  geometry.center();

  return geometry;
}



const cubeheadtxt = txtLoader.load("resources/lavatile.jpg");
cubeheadtxt.wrapS = THREE.RepeatWrapping;
cubeheadtxt.wrapT = THREE.RepeatWrapping;
cubeheadtxt.repeat.set(1, 1);

const geometrycubebtxt = createBoxWithRoundedEdges(2, 2, 0.5, 0.4, 30)
geometrycubebtxt.scale(0.47, 0.47, 0.3);
const materialcubebtxt = new THREE.MeshPhongMaterial({ map: cubeheadtxt });
const materialcubeBody = new THREE.MeshPhongMaterial({ color: 0xbcbcbc, map: cubeheadtxt });

const SnakeHead = new THREE.Mesh(geometrycubebtxt, materialcubebtxt);
SnakeHead.position.set(randomX_cube + cubeShift, randomY_cube + cubeShift, cubeshiftZ);
SnakeHead.castShadow = true;
SnakeHead.receiveShadow = true;
scene.add(SnakeHead);



const appleObj = new THREE.Mesh();
function createApple() {
  const appleBaseColor = txtLoader.load("resources/Apple_BaseColor.png");
  const appleNormal = txtLoader.load("resources/Apple_Normal.png");
  const appleRoughness = txtLoader.load("resources/Apple_Roughness.png");
  const ObjPath = 'resources/Apple.obj';
  const loaderOBJ = new THREE.OBJLoader();

  loaderOBJ.load(ObjPath, function (objChild) {
    const xScale = 0.009;
    objChild.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material.map = appleBaseColor;
        child.material.normalMap = appleNormal;
        child.material.specularMap = appleRoughness;
        // child.material.metalness = 0.7;
        // child.material.roughness = 0.7;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    objChild.scale.set(xScale, xScale, xScale)
    objChild.rotation.x = Math.PI / 2;
    appleObj.add(objChild);
  });


} createApple();

const food = appleObj;
food.position.set(randomNumberX_food, randomNumberY_food, foodShiftZ);
scene.add(food);

//  move
let speed = new THREE.Vector3(0, 0, 0);
// to control tha snake
function myCallback(event) {
  const speedValue = 1;
  const controlKey = {
    Left: "ArrowLeft",
    Right: "ArrowRight",
    Up: "ArrowUp",
    Down: "ArrowDown"
  };
  // to block move back if the snake has more than 2 cube
  if (!SnakeBody.isEmpty()) {
    if (event.key === controlKey.Left && SnakeBody.getFront().position.x != (SnakeHead.position.x - 1)) {   // left arrow key      
      speed.x = -speedValue;
      speed.y = 0;
      moveCameraHead("Left");
    }
    if (event.key === controlKey.Right && SnakeBody.getFront().position.x != (SnakeHead.position.x + 1)) {   // right arrow key   
      speed.x = speedValue;
      speed.y = 0;
      moveCameraHead("Right");
    }
    if (event.key === controlKey.Up && SnakeBody.getFront().position.y != (SnakeHead.position.y + 1)) {   // up arrow key     
      speed.y = speedValue;
      speed.x = 0;
      moveCameraHead("Up");
    }
    if (event.key === controlKey.Down && SnakeBody.getFront().position.y != (SnakeHead.position.y - 1)) {   // down arrow key      
      speed.y = -speedValue;
      speed.x = 0;
    }
  }
  // to allow move back if the snake has just 1 cube
  else {
    if (event.key === controlKey.Left) {   // left arrow key      
      speed.x = -speedValue;
      speed.y = 0;
      moveCameraHead("Left");
    }
    if (event.key === controlKey.Right) {   // right arrow key   
      speed.x = speedValue;
      speed.y = 0;
      moveCameraHead("Right");
    }
    if (event.key === controlKey.Up) {   // up arrow key    
      speed.y = speedValue;
      speed.x = 0;
      moveCameraHead("Up");
    }
    if (event.key === controlKey.Down) {   // down arrow key      
      speed.y = -speedValue;
      speed.x = 0;
      moveCameraHead("Down");
    }
  }
}
document.addEventListener("keydown", myCallback);

function createDisplayBoard() {
  for (let i = 0; i < 2; i++) {
    let minusl = -1;
    if (i == 1) {
      minusl = minusl * -1;
    }
    const geometry = new THREE.BoxGeometry(.15, .15, 2.7);
    const material = new THREE.MeshBasicMaterial({ color: colors.DisplayBoard });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(minusl * 4, 6.3, 1.3);
    cube.castShadow = true;
    scene.add(cube);
  }
  const geometryp = new THREE.BoxGeometry(8, 2.5, 0.15);
  const materialp = new THREE.MeshBasicMaterial({ color: colors.DisplayBoard, side: THREE.DoubleSide });
  const DisplayBoard = new THREE.Mesh(geometryp, materialp);
  DisplayBoard.rotation.x = Math.PI / 2;
  DisplayBoard.position.set(0, 6.2, 2.5);
  DisplayBoard.castShadow = true;
  scene.add(DisplayBoard);

  const CounterPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.05),
    new THREE.MeshBasicMaterial({ color: "#bbbbbb" }));
  CounterPlane.position.set(2.75, 6.12, 1.85)
  CounterPlane.rotation.x = Math.PI / 2;
  scene.add(CounterPlane);
}
createDisplayBoard();

//The X axis is red. The Y axis is green. The Z axis is blue.

// Create object to apply texture
const headCameraPlan = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 2.5),
  new THREE.MeshBasicMaterial({ color: "#bbbbbb" }));
headCameraPlan.position.set(-1.25, 6.11, 2.5)
headCameraPlan.rotation.x = Math.PI / 2;
scene.add(headCameraPlan);

const rtHeight = 200;
const rtWidth = 200;
const rt = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
headCameraPlan.material.map = rt.texture;
headCameraPlan.material.needsUpdate = true;
const rtCamera = new THREE.PerspectiveCamera(90, rt.width / rt.height, 0.1, 100);
rtCamera.rotation.x = Math.PI / 2;



const countmesh = new THREE.Mesh();
function counter(scoreNumber) {
  const fontPath = 'resources/kenpixel.ttf';
  const numbSt = scoreNumber.toString();
  const height = 20,
    size = 70,
    curveSegments = 4,
    bevelThickness = 2,
    bevelSize = 1.5

  const loaderttf = new THREE.TTFLoader();
  loaderttf.load(fontPath, function (json) {

    let font = new THREE.Font(json);

    const textGeo = new THREE.TextGeometry(numbSt, {
      font: font,
      size: size,
      height: height,
      curveSegments: curveSegments,
      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelEnabled: true

    });

    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });
    const textMesh1 = new THREE.Mesh(textGeo, material);

    textMesh1.rotation.x = Math.PI / 2;
    textMesh1.scale.set(0.01, 0.01, 0.001);

    if (scoreNumber < 10) {
      textMesh1.position.set(2.5, 6.14, 1.45);
      // console.log("SnakeBody.size() < 10")
    }
    else if (9 < scoreNumber < 100) {
      textMesh1.position.set(2.2, 6.14, 1.45);
      // console.log("9 < SnakeBody.size() < 100")
    }
    else if (scoreNumber > 99) {
      textMesh1.position.set(1.5, 6.14, 1.45);
    }

    while (countmesh.children.length) {
      countmesh.remove(countmesh.children[0]);
    }

    countmesh.add(textMesh1);
    scene.add(countmesh);

  });
}
counter(SnakeBody.size());
// counter(1);


function moveCameraHead(direction) {
  rtCamera.rotation.set(0, 0, 0);
  switch (direction) {
    case 'Left':
      rtCamera.rotation.y = Math.PI / 2;
      rtCamera.rotation.x = Math.PI / 2;
      break;
    case 'Right':
      rtCamera.rotation.y = -Math.PI / 2;
      rtCamera.rotation.x = Math.PI / 2;
      break;
    case 'Up':
      rtCamera.rotation.x = Math.PI / 2;
      break;
    case 'Down':
      rtCamera.rotation.x = -Math.PI / 2;
      rtCamera.rotation.z = Math.PI;
      break;
    default:
      console.log("wrong direction");
  }
}


function DisplayBoardClock() {
  let hands = new Array();
  const ClockElements = new THREE.Group();
  function drawTicks(height, width1, depth, colorTicks) {
    const TicksWidthSegments = 100;
    const geometrydrawTicks = new THREE.BoxBufferGeometry(width1, height, depth, TicksWidthSegments);
    const materialdrawTicks = new THREE.MeshStandardMaterial({
      color: colorTicks,
      metalness: 0.5,
      roughness: 0.1,
      flatShading: true,
      side: THREE.DoubleSide
    });
    const tick = new THREE.Mesh(geometrydrawTicks, materialdrawTicks);
    return tick;
  }

  const TicksDistanceFrame = {
    Small: 4.21,
    Big: 3.92
  };

  const BigTicksSize = {
    x: 1.05,
    y: 0.2,
    z: 0.8
  };

  const SmallTicksSize = {
    x: 0.5,
    y: 0.14,
    z: 0.8
  };

  //to draw the hours Ticks

  //draw Big Ticks 12 times
  for (let i = 0; i < 12; i++) {

    let BigTicks = drawTicks(BigTicksSize.x, BigTicksSize.y, BigTicksSize.z, colors.Clock);
    let BigTicksAngle = i / 12 * Math.PI * 2;
    BigTicks.rotation.z = -BigTicksAngle;
    BigTicks.position.set(Math.sin(BigTicksAngle) * TicksDistanceFrame.Big, Math.cos(BigTicksAngle) * TicksDistanceFrame.Big, 0.5);
    ClockElements.add(BigTicks);
  }

  //to draw the minutes Ticks
  for (let i = 0; i < 60; i++) {
    // to skip drawing on hours ticks place
    if (i % 5 != 0) {
      let SmallTicks = drawTicks(SmallTicksSize.x, SmallTicksSize.y, SmallTicksSize.z, colors.Clock);

      let SmallTicksAngle = i / 60 * Math.PI * 2;
      SmallTicks.rotation.z = -SmallTicksAngle;

      SmallTicks.position.set(Math.sin(SmallTicksAngle) * TicksDistanceFrame.Small, Math.cos(SmallTicksAngle) * TicksDistanceFrame.Small, 0.5);
      ClockElements.add(SmallTicks);
    }
  }

  const BlobSize = {
    radius: 0.5,
    length: 2,
    capSegments: 50,
    radialSegments: 80
  };
  const geometryBlob = new THREE.CapsuleGeometry(BlobSize.radius, BlobSize.length, BlobSize.capSegments, BlobSize.radialSegments);
  const materialBlob = new THREE.MeshStandardMaterial({
    color: colors.Clock,
    metalness: 0.5,
    roughness: 0.1,
    flatShading: true,
    side: THREE.DoubleSide
  });
  const blob = new THREE.Mesh(geometryBlob, materialBlob);
  blob.rotation.x = Math.PI / 2
  blob.position.set(0, 0, 0.6);
  blob.scale.set(0.5, 0.32, 0.4);
  ClockElements.add(blob);

  const handsMish = {
    handMaterial: new THREE.MeshStandardMaterial({
      color: colors.Clock,
      metalness: 0.5,
      roughness: 0.1,
      flatShading: true,
      side: THREE.DoubleSide
    }),
    hourhandGeometry: new THREE.SphereGeometry(3, 32, 16),
    minuteshandGeometry: new THREE.SphereGeometry(5, 32, 16)
  };

  const secondsLinesSize = {
    x: 4,
    y: 0.15,
    z: 0.15
  };
  hands[0] = drawTicks(secondsLinesSize.x, secondsLinesSize.y, secondsLinesSize.z, colors.Clock);
  //clock 
  // draw  second Line of clock 
  // const secondsLine = drawTicks(secondsLinesSize.x, secondsLinesSize.y, secondsLinesSize.z, colors.Clock);
  ClockElements.add(hands[0]);

  // draw  hour hand of clock 
  // const hourhand1 = new THREE.Mesh(handsMish.hourhandGeometry, handsMish.handMaterial);
  hands[1] = new THREE.Mesh(handsMish.hourhandGeometry, handsMish.handMaterial);
  hands[1].scale.set(.04, .04, .4, 1);
  ClockElements.add(hands[1]);

  // draw  minutes hand of clock 
  hands[2] = new THREE.Mesh(handsMish.minuteshandGeometry, handsMish.handMaterial);
  // const minuteshand1 = new THREE.Mesh(handsMish.minuteshandGeometry, handsMish.handMaterial);
  hands[2].scale.set(.03, .02, .5, 1);
  ClockElements.add(hands[2]);

  //to move hands of clock 
  const clockscale = 0.14;
  ClockElements.rotation.x = Math.PI / 2;
  ClockElements.position.set(2.75, 6.25, 3.05);
  ClockElements.scale.set(clockscale, clockscale, clockscale)
  scene.add(ClockElements);
  return hands;
}

function moveClockHands(handsArray) {
  const DistanceHandsofAxis = {
    R: 1.9,
    zClock1: 0.9,
    zClock2: 0.1
  };
  let data = new Date();
  // to move second Line of clock 
  let hourAngle = (data.getHours() + data.getMinutes() / 60) / 12 * Math.PI * 2;
  handsArray[1].rotation.x = Math.PI / 2;
  handsArray[1].rotation.y = -(hourAngle);
  handsArray[1].position.set(Math.sin(hourAngle), Math.cos(hourAngle), DistanceHandsofAxis.zClock1);

  // to move minutes hand of clock 
  let minutesAngle = data.getMinutes() / 60 * Math.PI * 2;
  handsArray[2].rotation.x = Math.PI / 2;
  handsArray[2].rotation.y = -minutesAngle;
  handsArray[2].position.set(Math.sin(minutesAngle) * DistanceHandsofAxis.R, Math.cos(minutesAngle) * DistanceHandsofAxis.R, DistanceHandsofAxis.zClock1);

  // to move hour hand of clock 
  let secondsAngle = data.getSeconds() / 60 * Math.PI * 2;
  handsArray[0].rotation.z = -secondsAngle;
  handsArray[0].position.set(Math.sin(secondsAngle) * DistanceHandsofAxis.R, Math.cos(secondsAngle) * DistanceHandsofAxis.R, DistanceHandsofAxis.zClock1);
}
const ClockMoveHandsArray = DisplayBoardClock();
//end clock
///////////////////////////////////
// * moveSnake
const controls = new THREE.TrackballControls(camera, renderer.domElement);
const clock = new THREE.Clock();

const h = 250;

// update ball position
function moveSnake() {
  const tempMoveSnake = {
    x: SnakeHead.position.x,
    y: SnakeHead.position.y
  };
  // counter(SnakeBody.size());
  rtCamera.position.set(SnakeHead.position.x + speed.x, SnakeHead.position.y + speed.y, SnakeHead.position.z)
  SnakeHead.position.set(tempMoveSnake.x + speed.x, tempMoveSnake.y + speed.y, cubeshiftZ);
  SnakeBody.insertFront(new THREE.Mesh(geometrycubebtxt, materialcubeBody));
  SnakeBody.getFront().position.set(tempMoveSnake.x, tempMoveSnake.y, cubeshiftZ);
  SnakeBody.getFront().castShadow = true;
  SnakeBody.getFront().receiveShadow = true;
  createfood();
  scene.add(SnakeBody.getFront());
  scene.remove(SnakeBody.getBack());
  SnakeBody.removeBack();
  AlertResetGame(PlayingFieldSize);
}

let testSnakeBody_X, testSnakeBody_Y;
//creating food for the snake
function createfood() {
  let tempCreatfood = {
    x: SnakeHead.position.x,
    y: SnakeHead.position.y
  };
  //creating food if the position of head is position of food 
  if ((SnakeHead.position.x == food.position.x) && (SnakeHead.position.y == food.position.y)) {
    counter(SnakeBody.size());

    //just one cube then take over the position of head 
    if (SnakeBody.isEmpty()) {
      tempCreatfood.x = SnakeHead.position.x;
      tempCreatfood.y = SnakeHead.position.y;
    }
    //more than one cube then take over the position of last cube in the snake 
    else {
      tempCreatfood.x = SnakeBody.getBack().position.x;
      tempCreatfood.y = SnakeBody.getBack().position.y;
    }
    SnakeBody.insertBack(new THREE.Mesh(geometrycubebtxt, materialcubeBody));
    SnakeBody.getBack().position.set(tempCreatfood.x - speed.x, tempCreatfood.y - speed.y, cubeShift);
    scene.add(SnakeBody.getBack());
    food.position.set(randomNumberMinMax(RandomNumber.Min, RandomNumber.Max) + cubeShift,
      randomNumberMinMax(RandomNumber.Min, RandomNumber.Max) + cubeShift, foodShiftZ);
  }
  // to test if the food is created inside the snake
  for (let i = 0; i < SnakeBody.size(); i++) {
    testSnakeBody_X = SnakeBody.getValues()[i].position.x;
    testSnakeBody_Y = SnakeBody.getValues()[i].position.y;
    if (((SnakeBody.getValues()[i].position.x == food.position.x) && (SnakeBody.getValues()[i].position.y == food.position.y))) {
      food.position.set(randomNumberMinMax(RandomNumber.Min, RandomNumber.Max) + cubeShift,
        randomNumberMinMax(RandomNumber.Min, RandomNumber.Max) + cubeShift, foodShiftZ);
      scene.add(food);
    }
  }
}

//to reset the game and creat alert to report game over
function AlertResetGame(PlayingFieldSize1) {

  const endField = PlayingFieldSize1 / 2 + 0.5;
  const alertMessage = "Game Over \n\nYour score: ";
  let score = SnakeBody.size();
  //for Checking if the snake intersects itself
  for (let i = 2; i < SnakeBody.size(); i++) {
    testSnakeBody_X = SnakeBody.getValues()[i].position.x;
    testSnakeBody_Y = SnakeBody.getValues()[i].position.y;

    if (((testSnakeBody_X == SnakeHead.position.x) && (testSnakeBody_Y == SnakeHead.position.y))) {
      alert(alertMessage + score);
      resetPlay();
    }
  }
  // check if the head of the snake move beyond the boundaries of the playing field
  if ((SnakeHead.position.x == endField) || (SnakeHead.position.y == endField)
    || (SnakeHead.position.x == -endField) || (SnakeHead.position.y == -endField)) {
    alert(alertMessage + score);
    resetPlay();
  }
}

function resetPlay() {
  const randomX_cube1 = randomNumberMinMax(RandomNumber.Min, RandomNumber.Max);
  const randomY_cube1 = randomNumberMinMax(RandomNumber.Min, RandomNumber.Max);
  const randomNumberX_food1 = randomNumberMinMax(RandomNumber.Min, RandomNumber.Max) + cubeShift;
  const randomNumberY_food1 = randomNumberMinMax(RandomNumber.Min, RandomNumber.Max) + cubeShift;
  speed.x = 0;
  speed.y = 0;
  for (let i = 0; i < SnakeBody.size(); i++) {
    scene.remove(SnakeBody.getValues()[i]);
  }
  SnakeBody.clear();
  food.position.set(randomNumberX_food1, randomNumberY_food1, foodShiftZ);
  SnakeHead.position.set(randomX_cube1 + cubeShift, randomY_cube1 + cubeShift, cubeshiftZ);
  counter(SnakeBody.size());

}

const tempT = setInterval(moveSnake, h);

// * Render loop
function render() {
  controls.update();
  requestAnimationFrame(render);
  moveClockHands(ClockMoveHandsArray);
  renderer.setRenderTarget(null);

  renderer.render(scene, camera);
  renderer.setRenderTarget(rt);
  renderer.render(scene, rtCamera);

}
render();

//random function with min and max value
function randomNumberMinMax(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}
// * Deque: https://learnersbucket.com/tutorials/data-structures/implement-deque-data-structure-in-javascript/

function Deque() {
  //To track the elements from back
  let count = 0;

  //To track the elements from the front
  let lowestCount = 0;

  //To store the data
  let items = {};
  this.getValues = () => { return Object.values(items); };

  //Add an item on the front
  this.insertFront = (elm) => {

    if (this.isEmpty()) {
      //If empty then add on the back
      this.insertBack(elm);

    } else if (lowestCount > 0) {
      //Else if there is item on the back
      //then add to its front
      items[--lowestCount] = elm;

    } else {
      //Else shift the existing items
      //and add the new to the front
      for (let i = count; i > 0; i--) {
        items[i] = items[i - 1];
      }

      count++;
      items[0] = elm;
    }
  };

  //Add an item on the back of the list
  this.insertBack = (elm) => {
    items[count++] = elm;
  };

  //Remove the item from the front
  this.removeFront = () => {
    //if empty return null
    if (this.isEmpty()) {
      return null;
    }

    //Get the first item and return it
    const result = items[lowestCount];
    delete items[lowestCount];
    lowestCount++;
    return result;
  };

  //Remove the item from the back
  this.removeBack = () => {
    //if empty return null
    if (this.isEmpty()) {
      return null;
    }

    //Get the last item and return it
    count--;
    const result = items[count];
    delete items[count];
    return result;
  };

  //Peek the first element
  this.getFront = () => {
    //If empty then return null
    if (this.isEmpty()) {
      return null;
    }

    //Return first element
    return items[lowestCount];
  };

  //Peek the last element
  this.getBack = () => {
    //If empty then return null
    if (this.isEmpty()) {
      return null;
    }

    //Return first element
    return items[count - 1];
  };

  //Check if empty
  this.isEmpty = () => {
    return this.size() === 0;
  };

  //Get the size
  this.size = () => {
    return count - lowestCount;
  };

  //Clear the deque
  this.clear = () => {
    count = 0;
    lowestCount = 0;
    items = {};
  };

  //Convert to the string
  //From front to back
  this.toString = () => {
    if (this.isEmpty()) {
      return '';
    }
    let objString = `${items[lowestCount]}`;
    for (let i = lowestCount + 1; i < count; i++) {
      objString = `${objString},${items[i]}`;
    }
    return objString;
  };
}
