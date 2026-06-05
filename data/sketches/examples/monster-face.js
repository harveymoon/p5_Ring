// shapes.js — pure-drawing demo
//
// Shows off all the primitives + nested transforms (push/pop, rotate).
// No sensor input, no autoRotate — the artwork stays put no matter how
// you hold the device. A good template if you want to design a fixed
// composition that doesn't react to tilt.



function setup() {
//  background(0);
//frameRate(10);
    autoRotate();
    
}
function draw() {
  background(0);
  
  noStroke();

  let r = noise(frameCount * 0.05) * 255;
  let g = noise(frameCount * 0.05 + 100) * 255;
  let b = noise(frameCount * 0.05 + 200) * 255;

  if (r > g && r > b) {
    r = 255;
  } else if (g > r && g > b) {
    g = 255;
  } else {
    b = 255;
  }


  fill(r, g, b);
//   fill(0, 255, 0); 

  for (let i = 0; i < 10; i = i + 1) {
    let x = noise(frameCount * 0.05 + i) * 240;
    let y = noise(frameCount * 0.05 + i + 100) * 240;
    let size = noise(frameCount * 0.05 + i + 200) * 90 + 60;

    circle(x, y, size);
  }

  // eyes
  fill(255);
  circle(100, 100, 50);
  circle(140, 100, 50);

  fill(0);
  circle(100, 100, 20);
  circle(140, 100, 20);
}