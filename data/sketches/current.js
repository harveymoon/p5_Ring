// p5-ring starter sketch.
//
// Tilt the device — the circle follows gravity.
// Edit this file in any editor, save, then eject the drive to reload.

function setup() {
  // nothing to do — the canvas is already 240x240
}

function draw() {
  background(8, 12, 30);

  // tilt-driven offset
  let cx = width / 2 + accelX * 60;
  let cy = height / 2 + accelY * 60;

  // sparkle ring
  noFill();
  stroke(60, 200, 255, 120);
  strokeWeight(2);
  for (let i = 0; i < 6; i++) {
    let r = 60 + i * 8 + sin(frameCount * 0.05 + i) * 4;
    circle(width / 2, height / 2, r * 2);
  }

  // ball
  noStroke();
  fill(255, 180, 80);
  circle(cx, cy, 40);
  fill(255, 230, 180);
  circle(cx - 6, cy - 6, 12);
}
