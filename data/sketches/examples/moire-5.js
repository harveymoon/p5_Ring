let v = 5;

function setup() {
//  createCanvas(240, 240);
  autoRotate();
  background(0);
}

function draw() {
  
noFill();
    strokeWeight(3);
  let shiftX = map(sin(frameCount * 0.02), -1, 1, 5, 480);
  let shiftY = map(cos(frameCount * 0.02), -1, 1, 5, 240);

  let r = map(cos(frameCount * 0.02), -1, 1, 1, 2);

  
    
  translate(width / 2, height / 2);
//    stroke(255);
  rotate(r * v);
    
    // RGB cycling without HSB
  let red = 128 + 127 * sin(frameCount * 0.02);
  let green = 128 + 127 * sin(frameCount * 0.02 + 2);
  let blue = 128 + 127 * sin(frameCount * 0.02 + 4);
  stroke(red, green, blue);
    
    
  ellipse(0, 0, shiftX, shiftY);
}