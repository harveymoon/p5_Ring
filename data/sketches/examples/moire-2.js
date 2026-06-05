function setup() {

//  strokeWeight(3);
  noFill();
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  let t = (frameCount % 20) / 10 * TWO_PI;
//strokeWeight(2);
  // magenta
  push();
  stroke(255, 0, 255);
  rotate(t);
  translate(-20, 0);
  for (let a = 0; a < TWO_PI; a += TWO_PI / 80) {
    line(0, 0, cos(a) * width / 2.5, sin(a) * height / 2.5);
  }
  pop();


//  // cyan
  push();
  stroke(0, 255, 255);
  rotate(t);
  translate(0, -20);
  for (let a = 0; a < TWO_PI; a += TWO_PI / 80) {
    line(0, 0, cos(a) * width / 2.5, sin(a) * height / 2.5);
  }
  pop();
    
 // yellow
  push();
  stroke(255, 255, 0);
  rotate(-t);
  translate(20, 0);
  for (let a = 0; a < TWO_PI; a += TWO_PI / 120) {
    line(0, 0, cos(a) * width / 2.5, sin(a) * height / 2.5);
  }
  pop();
//
//  // orange
//  push();
//  stroke(255, 128, 0);
//  rotate(-t);
//  translate(0, 20);
//  for (let a = 0; a < TWO_PI; a += TWO_PI / 80) {
//    line(0, 0, cos(a) * width / 2, sin(a) * height / 2);
//  }
//  pop();
}