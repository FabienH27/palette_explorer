let x, y, x2, y2;
let rectangles = [];

let pointer;

let editMode = false;
let drawMode = false;
let swatchMode = false;

let dragging = false;
let preventDrag = false;

let hoveredRectangle = -1;
let selectedRectangleEdge = -1;
let selectedSwatchRect = -1;

let selectedSwatchRects = [];

let brightness;

let colors = []; // Array to store colors

let offsetX, offsetY;

function setup() {
  const canvas = createCanvas(windowWidth - 50, 700);
  canvas.parent("sketch-holder");
  rectMode("corners");
  colorMode(HSB, 360, 100, 100);

  for (let i = 0; i < 50; i++) {
    colors[i] = [random(360), random(100), random(80) + 20];
  }
}

function draw() {
  x2 = mouseX;
  y2 = mouseY;
  background(0, 0, 80);

  noStroke();
  if (mouseIsPressed && !editMode && !dragging) {
    rect(x, y, x2, y2);
  }
  cursor("auto");
  // hoveredRectangle = -1;
  for (let i = 0; i < rectangles.length; ++i) {
    let rectangle = rectangles[i];

    fill(rectangle.color ?? "white");
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

  //Hue & saturation variation
  if (swatchMode) {
    let hueValue = map(mouseX, 0, width, 0, 360);
    let saturationValue = map(mouseY, 0, height, 100, 0);

    selectedSwatchRects.forEach((rect) => {
      rectangles[rect].color[0] = hueValue;
      rectangles[rect].color[1] = saturationValue;
    });
  }
}

//handle brightness
function mouseWheel(event) {
  if (swatchMode) {
    if (event.deltaY > 0) {
      //scroll down
      selectedSwatchRects.forEach((rect) => {
        if (rectangles[rect].color[2] >= 0) {
          rectangles[rect].color[2] -= 3;
        }
      });
    } else {
      selectedSwatchRects.forEach((rect) => {
        if (rectangles[rect].color[2] <= 100) {
          rectangles[rect].color[2] += 3;
        }
      });
    }
  }
}

function enableEditMode(rectangleId, verticeId, positionX, positionY) {
  editMode = true;
  hoveredRectangle = rectangleId;
  selectedRectangleEdge = verticeId;
  cursor("crosshair");
  circle(positionX, positionY, 20);
}

function mouseDragged() {
  const rectangle = rectangles[hoveredRectangle];
  if (editMode && !dragging) {
    rectangle.width = rectangle.x2 - rectangle.x;
    rectangle.height = rectangle.y2 - rectangle.y;
    switch (selectedRectangleEdge) {
      case 0:
        [rectangle.x, rectangle.y] = [mouseX, mouseY];
        break;
      case 1:
        [rectangle.x, rectangle.y2] = [mouseX, mouseY];
        break;
      case 2:
        [rectangle.x2, rectangle.y] = [mouseX, mouseY];
        break;
      case 3:
        [rectangle.x2, rectangle.y2] = [mouseX, mouseY];
        break;
      default:
        break;
    }
  } else {
    if (dragging && !editMode) {
      drawMode = false;
      preventDrag = true;

      rectangle.x = mouseX - offsetX;
      rectangle.y = mouseY - offsetY;

      rectangle.x2 = rectangle.x + rectangle.width;
      rectangle.y2 = rectangle.y + rectangle.height;
    } else {
      drawMode = true;
    }
  }
}

function doubleClicked() {
  swatchMode = true;
  if (checkOverlap()) {
    selectedSwatchRects = [hoveredRectangle];
  }
}

function mousePressed() {
  // checkOverlap();
  if (swatchMode) {
    // if (checkOverlap()) {
    //   //over a rectangle
    //   selectedSwatchRects.push(hoveredRectangle);
    // } else {
    //   selectedSwatchRects.splice(hoveredRectangle, 1);
    // }

    swatchMode = false;
  }

  //over a rectangle
  if (checkOverlap()) {
    const item = rectangles[hoveredRectangle];

    rectangles.copyWithin(hoveredRectangle, hoveredRectangle + 1);
    rectangles.pop();
    rectangles.push(item);

    hoveredRectangle = rectangles.indexOf(item);
    // selectedSwatchRects = [rectangles.indexOf(item)];

    dragging = true;
    //Calculate initial offset
    offsetX = mouseX - rectangles[hoveredRectangle].x;
    offsetY = mouseY - rectangles[hoveredRectangle].y;
  } else {
    selectedSwatchRects = [];
  }

  x = mouseX;
  y = mouseY;
  editMode = false;
  selectedRectangleEdge = -1;
}

function mouseReleased() {
  dragging = false;
  preventDrag = false;

  if (
    !editMode &&
    Math.abs(x - x2) > 25 &&
    Math.abs(y - y2) > 25 &&
    !checkOverlap() &&
    !dragging
  ) {
    drawMode = false;

    rectangles.push({
      x: min(x, x2),
      y: min(y, y2),
      x2: max(x2, x),
      y2: max(y2, y),
      width: abs(x2 - x),
      height: abs(y2 - y),
      color: colors[rectangles.length],
    });
  }
}

function checkOverlap() {
  const isInside = (rectangle, i) => {
    hoveredRectangle = i;

    // hoveredRectangle = rectangles.length - 1;
    const leftSide = min(rectangle.x, rectangle.x2);
    const rightSide = max(rectangle.x, rectangle.x2);

    const upperBound = min(rectangle.y, rectangle.y2);
    const lowerBound = max(rectangle.y, rectangle.y2);

    return (
      mouseX > leftSide &&
      mouseX < rightSide &&
      mouseY > upperBound &&
      mouseY < lowerBound
    );
  };
  return rectangles.some(isInside);
}

function checkOverlap2() {
  const isInside = (rectangle, i) => {
    // hoveredRectangle = rectangles.length - 1;
    const leftSide = min(rectangle.x, rectangle.x2);
    const rightSide = max(rectangle.x, rectangle.x2);

    const upperBound = min(rectangle.y, rectangle.y2);
    const lowerBound = max(rectangle.y, rectangle.y2);

    hoveredRectangle = i;

    return (
      mouseX > leftSide &&
      mouseX < rightSide &&
      mouseY > upperBound &&
      mouseY < lowerBound
    );
  };
  return rectangles.some(isInside);
}
