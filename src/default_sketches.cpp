#include "default_sketches.h"

// Example sketches shipped on every device. Each one is also in
// data/sketches/examples/ for repo-level browsing. Comments are kept
// because they're load-bearing — the sketches double as teaching material.

static const char EX_SHAPES[] = R"JS(// shapes.js — pure-drawing demo
//
// Shows off all the primitives + nested transforms (push/pop, rotate).
// No sensor input, no autoRotate — the artwork stays put no matter how
// you hold the device.

function setup() {}

function draw() {
  background(10, 8, 22);

  // Move origin to canvas center.
  push();
  translate(120, 120);

  // Slowly-advancing time variable used to drive rotations.
  let t = frameCount * 0.012;

  // Outer ring: stroke only, no fill.
  noFill();
  stroke(80, 160, 220, 180);
  strokeWeight(1);
  circle(0, 0, 200);

  // 8 ellipse petals rotating one way.
  for (let i = 0; i < 8; i++) {
    push();
    rotate(t + i * (PI / 4));
    noStroke();
    fill(120 + i * 14, 100 + i * 16, 220);
    ellipse(0, -60, 30, 60);
    pop();
  }

  // 6 triangles rotating the other way.
  for (let i = 0; i < 6; i++) {
    push();
    rotate(-t * 1.5 + i * (PI / 3));
    fill(255, 180, 80);
    noStroke();
    triangle(0, -36, -8, -22, 8, -22);
    pop();
  }

  // Center triangle, fastest.
  push();
  rotate(t * 2.2);
  fill(255, 220, 100);
  noStroke();
  triangle(0, -16, -14, 10, 14, 10);
  pop();

  // 4 cardinal dots.
  noStroke();
  fill(220, 240, 255);
  for (let i = 0; i < 4; i++) {
    push();
    rotate(i * HALF_PI);
    circle(0, -88, 4);
    pop();
  }

  pop();
})JS";

static const char EX_TILT[] = R"JS(// tilt.js — auto-rotate demo
//
// Calling autoRotate() in setup() makes the canvas turn with the device,
// so "up" on the artwork always matches real-world up. Try tilting it.

function setup() {
  autoRotate();
}

function draw() {
  background(8, 8, 24);

  push();
  translate(120, 120);

  noStroke();
  fill(255, 200, 80);
  triangle(0, -60, -40, 40, 40, 40);
  fill(20, 8, 8);
  triangle(0, -50, -28, 32, 28, 32);

  pop();

  fill(220, 240, 255);
  textSize(8);
  textAlign(CENTER);
  text("UP", 120, 80);
})JS";

static const char EX_SENSORS[] = R"JS(// sensors.js — feature showcase
//
// Demonstrates: drawing primitives, transforms, text, accelerometer
// readouts, and live frameCount. Tilt the device — the arrow tracks
// gravity and the numbers update in real time.

function setup() {}

function draw() {
  background(8, 10, 18);

  // Crosshair reference.
  stroke(40, 80, 110);
  strokeWeight(1);
  line(0, 120, 240, 120);
  line(120, 0, 120, 240);

  // Tilt arrow from center.
  push();
  translate(width / 2, height / 2);
  let ax = accelX * 70;
  let ay = accelY * 70;
  stroke(255, 200, 80);
  strokeWeight(3);
  line(0, 0, ax, ay);
  noStroke();
  fill(255, 220, 130);
  circle(ax, ay, 12);
  fill(255);
  circle(ax + 3, ay - 3, 4);
  pop();

  // Orbit of dots — pure transform demo.
  push();
  translate(width / 2, height / 2);
  noStroke();
  for (let i = 0; i < 6; i++) {
    let a = frameCount * 0.03 + i * 1.0472;
    fill(80 + i * 25, 200, 255);
    circle(cos(a) * 95, sin(a) * 95, 7);
  }
  pop();

  // Readouts — str() needed because mJS rejects "text " + number.
  fill(220, 230, 240);
  textSize(8);
  textAlign(LEFT);
  text("accelX " + str(round(accelX * 100) / 100), 70, 38);
  text("accelY " + str(round(accelY * 100) / 100), 70, 50);
  text("accelZ " + str(round(accelZ * 100) / 100), 70, 62);
  textAlign(CENTER);
  text("frame " + str(frameCount), 120, 205);
})JS";

static const char EX_RAIN[] = R"JS(// rain.js — particle system, gravity-aware
//
// A simple "falling rain" effect. Each drop has its own velocity and
// length. Tilt the device left/right to make the rain lean.

let drops = [];
let N = 35;   // reduced — keeps the on-device interpreter under the watchdog

function setup() {
  // Pre-allocate every drop in setup() — cheaper than recreating in draw().
  for (let i = 0; i < N; i++) {
    drops.push({
      x: random(0, 240),
      y: random(0, 240),
      vy: random(2, 5),
      len: random(6, 16)
    });
  }
}

function draw() {
  background(6, 8, 18);
  stroke(120, 200, 255, 180);
  strokeWeight(1);

  for (let i = 0; i < N; i++) {
    let d = drops[i];
    d.x = d.x + accelX * 1.2;
    d.y = d.y + d.vy + accelY * 0.8;
    line(d.x, d.y, d.x, d.y + d.len);
    if (d.y > 240) { d.y = -10; d.x = random(0, 240); }
    if (d.x < 0)   { d.x = 240; }
    if (d.x > 240) { d.x = 0; }
  }
})JS";

static const char EX_WAVE[] = R"JS(// wave.js — sine wave field
//
// Two overlapping waves of different frequencies, with a white ball
// riding the top wave. Phase scrolls via frameCount.

function setup() {}

function draw() {
  background(10, 6, 24);
  noFill();
  strokeWeight(2);
  let t = frameCount * 0.04;

  // Upper wave.
  stroke(120, 220, 255);
  for (let x = 0; x < 240; x = x + 4) {
    point(x, 110 + sin(x * 0.05 + t) * 30);
  }

  // Lower wave — different frequency, scrolls the other way.
  stroke(255, 140, 180);
  for (let x = 0; x < 240; x = x + 4) {
    point(x, 150 + sin(x * 0.06 - t * 1.4) * 24);
  }

  // Ball rides the upper wave, wrapping every 200 frames.
  let bx = 20 + ((frameCount * 1.5) % 200);
  let by = 110 + sin(bx * 0.05 + t) * 30;
  noStroke();
  fill(255);
  circle(bx, by, 8);
})JS";

static const char EX_CLOCK[] = R"JS(// clock.js — analog clock showing time since boot
//
// Nested rotate/push/pop transforms. Each hand isolates its rotation
// from the others. Time = ms since power-up, so it starts at 12.
// Calls autoRotate() so the dial stays oriented to gravity.

function setup() { autoRotate(); }

function draw() {
  background(12, 8, 20);
  let secs = millis() / 1000;

  push();
  translate(120, 120);

  // Dial outline + tick marks.
  noFill();
  stroke(60, 80, 110);
  strokeWeight(2);
  circle(0, 0, 200);
  stroke(120, 160, 200);
  for (let i = 0; i < 12; i++) {
    push();
    rotate(i * (PI / 6));
    line(0, -95, 0, -85);
    pop();
  }

  // Second hand — 60s/rev.
  push();
  rotate(secs * (TWO_PI / 60));
  stroke(255, 160, 80);
  strokeWeight(2);
  line(0, 0, 0, -85);
  pop();

  // Minute hand — 60min/rev.
  push();
  rotate((secs / 60) * (TWO_PI / 60));
  stroke(220, 240, 255);
  strokeWeight(4);
  line(0, 0, 0, -65);
  pop();

  // Hour hand — 12h/rev.
  push();
  rotate((secs / 3600) * (TWO_PI / 12));
  stroke(120, 200, 255);
  strokeWeight(5);
  line(0, 0, 0, -42);
  pop();

  // Center cap.
  noStroke();
  fill(255);
  circle(0, 0, 8);

  pop();
})JS";

static const char EX_SHAKE[] = R"JS(// shake.js — accel-driven particle system
//
// Particles drift with gravity. A hard shake (|accel| > 1.4 g) kicks
// every particle in a random direction. Damping + bouncing edges.

let parts = [];
let N = 40;

function setup() {
  for (let i = 0; i < N; i++) {
    parts.push({ x: 120, y: 120, vx: 0, vy: 0, h: i * 9 });
  }
}

function draw() {
  // Alpha < 255 in background = fading trails.
  background(10, 12, 20, 200);

  // Shake magnitude.
  let shake = sqrt(accelX * accelX + accelY * accelY);
  let kick = 0;
  if (shake > 1.4) { kick = (shake - 1.4) * 6; }

  noStroke();
  for (let i = 0; i < N; i++) {
    let p = parts[i];

    // Random kick on shake.
    if (kick > 0) {
      p.vx = p.vx + (random(-1, 1)) * kick;
      p.vy = p.vy + (random(-1, 1)) * kick;
    }

    // Drag + gravity.
    p.vx = p.vx * 0.94 + accelX * 0.3;
    p.vy = p.vy * 0.94 + accelY * 0.3;
    p.x = p.x + p.vx;
    p.y = p.y + p.vy;

    // Bounce off edges.
    if (p.x < 10 || p.x > 230) { p.vx = -p.vx * 0.5; }
    if (p.y < 10 || p.y > 230) { p.vy = -p.vy * 0.5; }

    // Color cycles by hue + time.
    let r = (((p.h + frameCount) * 1.4) % 240);
    let g = (((p.h + frameCount) * 0.6) % 240);
    fill(150 + r * 0.4, 100 + g * 0.5, 220);
    circle(p.x, p.y, 7);
  }
})JS";

const DefaultExample DEFAULT_EXAMPLES[] = {
    { "/sketches/examples/shapes.js",  EX_SHAPES },
    { "/sketches/examples/tilt.js",    EX_TILT },
    { "/sketches/examples/sensors.js", EX_SENSORS },
    { "/sketches/examples/rain.js",    EX_RAIN },
    { "/sketches/examples/wave.js",    EX_WAVE },
    { "/sketches/examples/clock.js",   EX_CLOCK },
    { "/sketches/examples/shake.js",   EX_SHAKE },
    { nullptr, nullptr }
};
