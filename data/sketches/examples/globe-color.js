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
let spin = frameCount * 0.03;

noFill();

// outer sphere
stroke(255);
strokeWeight(2);
circle(0, 0, r * 2);

// latitude lines
for (let lat = -75; lat <= 75; lat += 20) {
  let y = sin(radians(lat)) * r;
  let w = cos(radians(lat)) * r * 2;

  let red = 128 + 127 * sin(frameCount * 0.02 + lat);
  let green = 128 + 127 * sin(frameCount * 0.02 + lat + 2);
  let blue = 128 + 127 * sin(frameCount * 0.02 + lat + 4);

  stroke(red, green, blue);
  strokeWeight(1.5);

  ellipse(0, y, w, w * 0.22);
}

// longitude lines
for (let i = 0; i < 10; i++) {
  let angle = spin + i * PI / 10;
  let squash = abs(cos(angle));

  let red = 128 + 127 * sin(frameCount * 0.03 + i);
  let green = 128 + 127 * sin(frameCount * 0.03 + i + 2);
  let blue = 128 + 127 * sin(frameCount * 0.03 + i + 4);

  stroke(red, green, blue);
  strokeWeight(map(squash, 0, 1, 0.5, 2.5));

  ellipse(0, 0, r * 2 * squash, r * 2);
}
}