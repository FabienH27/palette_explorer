let x, y, x2, y2;
let rectangles = [];

let pointer;

let editMode = false;
let drawMode = false;
let swatchMode = false;
let hoveredRectangle = -1;
let allowDragging = true;
let dragging = false;

let selectedRectangle = -1;
let selectedRectangleEdge = -1;

let selectedSwatchRects = [];

let colors = []; // Array to store colors

let offsetX, offsetY;

function setup() {
  const canvas = createCanvas(windowWidth - 50, windowHeight - 50);
  canvas.parent("sketch-holder");
  rectMode("corners");
  colorMode(HSB, 360, 100, 100);

  document.addEventListener("contextmenu", (event) => event.preventDefault());

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
  for (let i = 0; i < rectangles.length; ++i) {
    let rectangle = rectangles[i];

    fill(rectangle.color ?? "white");
    rect(rectangle.x, rectangle.y, rectangle.x2, rectangle.y2);

    //bottom right
    if (
      !dragging &&
      !drawMode &&
      Math.abs(rectangle.x2 - x2) < 20 &&
      Math.abs(rectangle.y2 - y2) < 20
    ) {
      enableEditMode(i, 3, rectangle.x2, rectangle.y2);
    }

    //top right
    if (
      !dragging &&
      !drawMode &&
      Math.abs(rectangle.x2 - x2) < 20 &&
      Math.abs(rectangle.y - y2) < 20
    ) {
      enableEditMode(i, 2, rectangle.x2, rectangle.y);
    }

    //bottom left
    if (
      !dragging &&
      !drawMode &&
      Math.abs(rectangle.x - x2) < 20 &&
      Math.abs(rectangle.y2 - y2) < 20
    ) {
      enableEditMode(i, 1, rectangle.x, rectangle.y2);
    }

    //top left
    if (
      !dragging &&
      !drawMode &&
      Math.abs(rectangle.x - x2) < 20 &&
      Math.abs(rectangle.y - y2) < 20
    ) {
      enableEditMode(i, 0, rectangle.x, rectangle.y);
    }
  }

  //Hue & saturation variation
  if (swatchMode) {
    if (movedX > 0) {
      //move right
      selectedSwatchRects.forEach((rectangle) => {
        rectangles[rectangle].color[0] =
          (rectangles[rectangle].color[0] + 2) % 360;
      });
    } else if (movedX < 0) {
      //move left
      selectedSwatchRects.forEach((rectangle) => {
        rectangles[rectangle].color[0] =
          (rectangles[rectangle].color[0] - 2) % 360;
      });
    }

    if (movedY > 0) {
      //move down
      selectedSwatchRects.forEach((rectangle) => {
        rectangles[rectangle].color[1] = min(
          rectangles[rectangle].color[1] - 1,
          height
        );
      });
    } else if (movedY < 0) {
      //move up
      selectedSwatchRects.forEach((rectangle) => {
        rectangles[rectangle].color[1] = min(
          rectangles[rectangle].color[1] + 1,
          height
        );
      });
    }
  }
}

function keyPressed(){
    exitPointerLock();
    swatchMode = false;
    wasSwatching = true;
    allowDragging = true;
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
  selectedRectangle = rectangleId;
  selectedRectangleEdge = verticeId;
  circle(positionX, positionY, 20);
}

function mouseDragged() {
  const rectangle = rectangles[selectedRectangle];
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
    if (dragging && allowDragging && !editMode) {
      drawMode = false;

      rectangle.x = mouseX - offsetX;
      rectangle.y = mouseY - offsetY;

      rectangle.x2 = rectangle.x + rectangle.width;
      rectangle.y2 = rectangle.y + rectangle.height;
    } else {
    }
  }
}

function mouseMoved() {
  if (checkOverlap()) {
    editMode = false;
    hoveredRectangle = selectedRectangle;
  }
}

function doubleClicked() {
  allowDragging = false;
  if (checkOverlap()) {
    selectedSwatchRects.push(selectedRectangle);
  }
}

let wasSwatching = false;

function mousePressed() {
  //over a rectangle
  if (swatchMode) {
    allowDragging = true;
    wasSwatching = true;
    exitPointerLock();
  }

  swatchMode = false;

  if (mouseButton === RIGHT) {
    swatchMode = true;
    requestPointerLock();
  }

  if (!editMode) {
    if (checkOverlap()) {
      const item = rectangles[selectedRectangle];

      if (wasSwatching) {
        selectedSwatchRects = [];
      }

      if (allowDragging && !wasSwatching) {
        rectangles.copyWithin(selectedRectangle, selectedRectangle + 1);
        rectangles.pop();
        rectangles.push(item);
        selectedRectangle = rectangles.indexOf(item);
        editMode = false;
      }

      dragging = true;

      //Calculate initial offset
      offsetX = mouseX - rectangles[selectedRectangle].x;
      offsetY = mouseY - rectangles[selectedRectangle].y;
    }
  }

  x = mouseX;
  y = mouseY;
  editMode = false;
  selectedRectangleEdge = -1;
  wasSwatching = false;
}

function mouseReleased() {
  dragging = false;

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

/**
 * check if mouse is over a rectangle. Always returns the rectangle with the highest index
 */
function checkOverlap() {
  const isInside = (rectangle, i) => {
    const leftSide = Math.min(rectangle.x, rectangle.x2);
    const rightSide = Math.max(rectangle.x, rectangle.x2);
    const upperBound = Math.min(rectangle.y, rectangle.y2);
    const lowerBound = Math.max(rectangle.y, rectangle.y2);

    selectedRectangle = rectangles.indexOf(rectangle);

    return (
      mouseX > leftSide &&
      mouseX < rightSide &&
      mouseY > upperBound &&
      mouseY < lowerBound
    );
  };

  return findLastIndexMatching(isInside) !== -1;
}

/**
 *
 * @param array to perform the action on
 * @param predicate function applied to each element that should returns true or false
 * @returns
 */
function findLastIndexMatching(predicate) {
  for (let i = rectangles.length - 1; i >= 0; i--) {
    if (predicate(rectangles[i])) {
      return i;
    }
  }
  return -1; // Return -1 if no element matches the predicate
}
