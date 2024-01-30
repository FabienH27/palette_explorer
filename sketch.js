var x, y, x2, y2;
var rectangles = [];

var pointer;

var editMode = false;
var drawMode = false;

var selectedRectangle = -1;
var selectedRectangleEdge = -1;

var r;
var g;
var b;

let colors = []; // Array to store colors

function setup() {
  createCanvas(1600, 600);
  rectMode(CORNERS);

  for (let i = 0; i < 50; i++) {
    colors[i] = [random(255), random(255), random(255)];
  }
}

function draw() {
  x2 = mouseX;
  y2 = mouseY;
  background(200);
  noStroke();
  if (mouseIsPressed && !editMode) {
    rect(x, y, x2, y2);
  }
  cursor("auto");
  selectedRectangle = -1;
  for (let i = 0; i < rectangles.length; ++i) {
    let rectangle = rectangles[i];

    fill(colors[i] ?? "white");
    rect(rectangle.x, rectangle.y, rectangle.x2, rectangle.y2);

    //bottom right
    if (
      !drawMode &&
      Math.abs(rectangle.x2 - x2) < 20 &&
      Math.abs(rectangle.y2 - y2) < 20
    ) {
      enableEditMode(i, 3, rectangle.x2, rectangle.y2);
    }

    //top right
    if (
      !drawMode &&
      Math.abs(rectangle.x2 - x2) < 20 &&
      Math.abs(rectangle.y - y2) < 20
    ) {
      enableEditMode(i, 2, rectangle.x2, rectangle.y);
    }

    //bottom left
    if (
      !drawMode &&
      Math.abs(rectangle.x - x2) < 20 &&
      Math.abs(rectangle.y2 - y2) < 20
    ) {
      enableEditMode(i, 1, rectangle.x, rectangle.y2);
    }

    //top left
    if (
      !drawMode &&
      Math.abs(rectangle.x - x2) < 20 &&
      Math.abs(rectangle.y - y2) < 20
    ) {
      enableEditMode(i, 0, rectangle.x, rectangle.y);
    }
  }
}

function enableEditMode(rectangleId, verticeId, positionX, positionY) {
  editMode = true;
  selectedRectangle = rectangleId;
  selectedRectangleEdge = verticeId;
  cursor("crosshair");
  circle(positionX, positionY, 20);
}

function mouseDragged() {
  // fill("black");
  if (editMode) {
    const rect = rectangles[selectedRectangle];

    switch (selectedRectangleEdge) {
      case 0:
        [rect.x, rect.y] = [mouseX, mouseY];
        break;
      case 1:
        [rect.x, rect.y2] = [mouseX, mouseY];
        break;
      case 2:
        [rect.x2, rect.y] = [mouseX, mouseY];
        break;
      case 3:
        [rect.x2, rect.y2] = [mouseX, mouseY];
        break;
      default:
        break;
    }
  } else {
    drawMode = true;
  }
}

function mousePressed() {
  x = mouseX;
  y = mouseY;
  editMode = false;

  if(checkOverlap()){
    console.log("clicked on rect");
  }

}

function mouseReleased() {
  if (
    !editMode &&
    Math.abs(x - x2) > 25 &&
    Math.abs(y - y2) > 25 &&
    !checkOverlap()
  ) {
    randomizeColors();
    drawMode = false;
    rectangles.push({ x: x, y: y, x2: x2, y2: y2 });
  }
}

function randomizeColors() {
  r = random(255);
  g = random(255);
  b = random(255);
}

function checkOverlap() {
  const isInside = (rectangle, i) => {
    selectedRectangle = i;
    return (
      mouseX > rectangle.x &&
      mouseX < rectangle.x2 &&
      mouseY > rectangle.y &&
      mouseY < rectangle.y2
    );
  };
  return rectangles.some(isInside);
}

// function doubleClicked() {
//   rectangles.forEach((rectangle, i) => {
//     if (
//       mouseX > rectangle.x &&
//       mouseX < rectangle.x2 &&
//       mouseY > rectangle.y &&
//       mouseY < rectangle.y2
//     ) {
//       colors[i] = [0, 0, 0];
//     }
//   });
// }
