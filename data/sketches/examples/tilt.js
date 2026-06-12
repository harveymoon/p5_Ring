// tilt.js — auto-rotate demo
//
// By default p5-ring sketches stay put when you tilt the device — handy
// for fixed compositions. Calling autoRotate() in setup() opts in to
// gravity-aware behavior: the canvas turns so "up" on the artwork always
// matches real-world up.
//
// Try tilting the device while this is running — the triangle keeps
// pointing skyward.

function setup() {
  // Tell the firmware to rotate the canvas based on the accelerometer.
  // (Once enabled, it stays on until you call noAutoRotate() or load
  // another sketch.)
  autoRotate();
}

function draw() {
  background(8, 8, 24);

  // Move origin to center, then draw an upward-pointing triangle.
  push();
  translate(120, 120);

  noStroke();
  fill(255, 200, 80);                  // bright yellow outer triangle
  triangle(0, -60, -40, 40, 40, 40);

  // Inner shadow triangle to suggest depth.
  fill(20, 8, 8);
  triangle(0, -50, -28, 32, 28, 32);

  pop();

  // Label so it's obvious which way the artwork is pointing.
  fill(220, 240, 255);
  textSize(8);
  textAlign(CENTER);
  text("UP", 120, 80);
}
