// shapes.js — pure-drawing demo
//
// Shows off all the primitives + nested transforms (push/pop, rotate).
// No sensor input, no autoRotate — the artwork stays put no matter how
// you hold the device. A good template if you want to design a fixed
// composition that doesn't react to tilt.


let xs = [];
let ys = [];
let rs = [];
let speeds = [];
let wiggles = [];

function setup() {
    autoRotate();
    
    for (let i = 0; i < 20; i++) {
    xs[i] = random(width);
    ys[i] = random(height);
    rs[i] = random(6, 30);
    speeds[i] = random(0.3, 1.2);
    wiggles[i] = random(1000);
  }

}

function draw() {
  background(0);
  noFill();

  for (let i = 0; i < xs.length; i++) {
    ys[i] = ys[i] - speeds[i];
    xs[i] = xs[i] + sin(frameCount * 0.05 + wiggles[i]) * 0.4;

    if (ys[i] < -rs[i]) {
      ys[i] = height + rs[i];
      xs[i] = random(width);
    }

    stroke(255);
    strokeWeight(1.5);
    circle(xs[i], ys[i], rs[i] * 2);

    strokeWeight(1);
    arc(
      xs[i] - rs[i] * 0.25,
      ys[i] - rs[i] * 0.25,
      rs[i] * 0.6,
      rs[i] * 0.6,
      PI,
      PI + HALF_PI
    );
  }
}
