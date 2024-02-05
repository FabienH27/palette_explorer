let x, y, x2, y2;
let rectangles = [];

let pointer;

let editMode = false;
let drawMode = false;
let swatchMode = false;

let hoveredRectangle = -1;
let selectedRectangleEdge = -1;
let selectedSwatchRect = -1;

let selectedSwatchRects = [];

let brightness;

let colors = []; // Array to store colors

let dragging = false;
let offsetX, offsetY;

function setup() {
  const canvas = createCanvas(windowWidth - 50, 700);
  canvas.parent('sketch-holder');
  rectMode("corners");
  colorMode(HSB, 360,100,100);

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
  hoveredRectangle = -1;
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

  //Hue variation
  if(swatchMode){
    let hueValue = map(mouseX, 0, width, 0, 360);
    let saturationValue = map(mouseY, 0, height, 100, 0);

    selectedSwatchRects.forEach(rect => {
      colors[rect][0] = hueValue;
      colors[rect][1] = saturationValue;      
    });

    // colors[selectedSwatchRect][0] = hueValue;
    // colors[selectedSwatchRect][1] = saturationValue;
  }
  
}

function mouseWheel(event){
  if(swatchMode){

    if(event.deltaY > 0){
      //scroll down
      selectedSwatchRects.forEach(rect => {
        if(colors[rect][2] >= 0){
          colors[rect][2] -= 3;
        }
      });
      // if(colors[selectedSwatchRect][2] >= 0){
      //   colors[selectedSwatchRect][2] -= 3;
      // }
    }else{
      selectedSwatchRects.forEach(rect => {
        if(colors[rect][2] <= 100){
          colors[rect][2] += 3;
        }
      });
      // if(colors[selectedSwatchRect][2] <= 100){
      //   colors[selectedSwatchRect][2] += 3;
      // }
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
  if (editMode) {
    const rect = rectangles[hoveredRectangle];

    rect.width = rect.x2 - rect.x;
    rect.height = rect.y2 - rect.y;
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
    if (dragging) {
      checkOverlap();
      rectangles[hoveredRectangle].x = mouseX - offsetX;
      rectangles[hoveredRectangle].y = mouseY - offsetY;
      rectangles[hoveredRectangle].x2 =
        rectangles[hoveredRectangle].x + rectangles[hoveredRectangle].width;
      rectangles[hoveredRectangle].y2 =
        rectangles[hoveredRectangle].y + rectangles[hoveredRectangle].height;
    } else {
      drawMode = true;
    }
  }
}

function doubleClicked() {
  swatchMode = true;
  checkOverlap();
  selectedSwatchRects.push(hoveredRectangle);
}

function mousePressed() {
  console.log("mouse presed");
  if(swatchMode){
    if(checkOverlap()){
      //over a rectangle
      selectedSwatchRects.push(hoveredRectangle);
    }else{
      selectedSwatchRects.splice(hoveredRectangle, 1);
    }

    swatchMode = false;
    // selectedSwatchRects = [];
  }

  if (checkOverlap()) {
    // if(swatchMode){
    //   selectedSwatchRects.push(hoveredRectangle);
    // }


    dragging = true;
    //Calculate initial offset
    offsetX = mouseX - rectangles[hoveredRectangle].x;
    offsetY = mouseY - rectangles[hoveredRectangle].y;
  }else{
    selectedSwatchRects = []
  }

  x = mouseX;
  y = mouseY;
  editMode = false;
}

function mouseReleased() {
  dragging = false;

  if (
    !editMode &&
    Math.abs(x - x2) > 25 &&
    Math.abs(y - y2) > 25 &&
    !checkOverlap()
  ) {
    drawMode = false;

    rectangles.push({
      x: min(x, x2),
      y: min(y,y2),
      x2: max(x2,x),
      y2: max(y2,y),
      width: abs(x2 - x),
      height: abs(y2 - y),
    });
  }
}

function checkOverlap() {
  const isInside = (rectangle, i) => {
    hoveredRectangle = i;
    return (
      mouseX > rectangle.x &&
      mouseX < rectangle.x2 &&
      mouseY > rectangle.y &&
      mouseY < rectangle.y2
    );
  };
  return rectangles.some(isInside);
}