var x, y, x2, y2;
var rectangles = [];

var pointer;
var editMode = false;
var allowEdit = true;

var selectedRectangle = -1;
var selectedRectangleEdge = -1;

function setup() {
  createCanvas(1600, 600);
  rectMode(CORNERS);
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
    let r = rectangles[i];
    rect(r.x, r.y, r.x2, r.y2);

    //bottom right
    if (allowEdit && Math.abs(r.x2 - x2) < 20 && Math.abs(r.y2 - y2) < 20) {
      enableEditMode(i, 3, r.x2, r.y2);
    }

    //top right
    if (allowEdit && Math.abs(r.x2 - x2) < 20 && Math.abs(r.y - y2) < 20) {
      enableEditMode(i, 2, r.x2, r.y);
    }

    //bottom left
    if (allowEdit && Math.abs(r.x - x2) < 20 && Math.abs(r.y2 - y2) < 20) {
      enableEditMode(i, 1, r.x, r.y2);
    }

    //top left
    if (allowEdit && Math.abs(r.x - x2) < 20 && Math.abs(r.y - y2) < 20) {
      enableEditMode(i, 0, r.x, r.y);
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
  }
}

function mousePressed() {
  x = mouseX;
  y = mouseY;
  editMode = false;
}

function mouseReleased() {
  if (!editMode && Math.abs(x - x2) > 2 && Math.abs(y - y2) > 2) {
    rectangles.push({ x: x, y: y, x2: x2, y2: y2 });
  }
}
