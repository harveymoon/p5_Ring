// bars.js — two counter-rotating stripe layers create Moiré as you tilt.
// Layer 1 spins 2x clockwise with device rotation.
// Layer 2 spins 2x counter-clockwise. Their interference shifts with tilt.
// Tilt angle is EMA-smoothed (~10 s to settle) for a slow, fluid rotation.

let _cx = 0;
let _cy = 0;
let _tilt = 0;

function setup() {
  noAutoRotate();
}

function draw() {
  background(0);

  _cx = _cx * 0.98 + accelX * 0.02;
  _cy = _cy * 0.98 + accelY * 0.02;
  _tilt = atan2(_cy, _cx);

  stroke(255);
  strokeWeight(2);

  push();
  translate(120, 120);
  rotate(_tilt * 10);
  for (let x = -170; x <= 170; x = x + 20) {
    line(x, -170, x, 170);
  }
  pop();

  push();
  translate(120, 120);
  rotate(_tilt * -10);
  for (let x = -170; x <= 170; x = x + 20) {
    line(x, -170, x, 170);
  }
  pop();
}
