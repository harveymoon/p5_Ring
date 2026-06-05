// shapes.js — pure-drawing demo
//
// Shows off all the primitives + nested transforms (push/pop, rotate).
// No sensor input, no autoRotate — the artwork stays put no matter how
// you hold the device. A good template if you want to design a fixed
// composition that doesn't react to tilt.



function setup() {
    autoRotate();

}

function draw() {
    background(0);
translate(width / 2, height / 2);

  let r = 120;
  let spin = frameCount * 0.01;

  noFill();
  stroke(255);

  // outer sphere
  strokeWeight(2);
  circle(0, 0, r * 2);

  // latitude lines
  strokeWeight(1.5);
  for (let lat = -75; lat <= 75; lat += 20) {
    let y = sin(radians(lat)) * r;
    let w = cos(radians(lat)) * r * 2;
     
    ellipse(0, y, w, w * 0.22);
      
  }

  // longitude lines
  for (let i = 0; i < 10; i++) {
    let angle = spin + i * PI / 10;
    let squash = abs(cos(angle));

    strokeWeight(map(squash, 0, 1, 0.5, 2.5));
    ellipse(0, 0, r * 2 * squash, r * 2);
  }

}
