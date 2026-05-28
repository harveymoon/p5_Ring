// bubble.js — bubbles floating toward real-world north.
// Tilt the device to change which way the bubbles rise.

let xs = [];
let ys = [];
let rs = [];
let speeds = [];
let wiggles = [];
let N = 20;

let cachedAX = 0;
let cachedAY = 0;
let cu = 1;
let su = 0;
let a0 = 0;
let tiltTick = 0;

function setup() {
  for (let i = 0; i < N; i = i + 1) {
    xs[i] = random(240);
    ys[i] = random(240);
    rs[i] = random(6, 30);
    speeds[i] = random(0.3, 1.2);
    wiggles[i] = random(1000);
  }
}

function draw() {
  background(0);
  noFill();
  stroke(255);

  tiltTick++;
  if (tiltTick >= 3) {
    tiltTick = 0;
    cachedAX = accelX;
    cachedAY = accelY;
    let upAngle = atan2(-cachedAX, cachedAY);
    cu = cos(upAngle);
    su = sin(upAngle);
    a0 = PI + upAngle + HALF_PI;
  }

  for (let i = 0; i < N; i = i + 1) {
    xs[i] = xs[i] + cachedAY * speeds[i] + sin(frameCount * 0.05 + wiggles[i]) * 0.4;
    ys[i] = ys[i] - cachedAX * speeds[i];

    if (xs[i] < 0 - rs[i] || xs[i] > 240 + rs[i] || ys[i] < 0 - rs[i] || ys[i] > 240 + rs[i]) {
      let spread = random(-100, 100);
      xs[i] = 120 + (-cachedAY) * 140 + cachedAX * spread;
      ys[i] = 120 + cachedAX * 140 + cachedAY * spread;
    }

    strokeWeight(1.5);
    circle(xs[i], ys[i], rs[i] * 2);

    strokeWeight(1);
    let arcX = xs[i] + (cu + su) * rs[i] * 0.25;
    let arcY = ys[i] + (su - cu) * rs[i] * 0.25;
    arc(arcX, arcY, rs[i] * 0.6, rs[i] * 0.6, a0, a0 + HALF_PI);
  }
}
