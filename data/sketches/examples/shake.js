// shake.js — accel-driven particle system
//
// Particles drift around based on the accelerometer. When you shake the
// device hard, the shake threshold is crossed and every particle gets a
// random kick — like throwing them in the air. They settle as motion
// dampens.
//
// Demonstrates: particle state in an array, per-frame damping, sensor
// thresholding, color cycling via frameCount.

let parts = [];   // each entry: { x, y, vx, vy, h (hue offset) }
let N = 40;

function setup() {
  // All particles start at the canvas center, no velocity.
  for (let i = 0; i < N; i++) {
    parts.push({ x: 120, y: 120, vx: 0, vy: 0, h: i * 9 });
  }
}

function draw() {
  // Slight alpha on background = motion trails (each old frame fades).
  background(10, 12, 20, 200);

  // Total tilt magnitude. Above ~1.4 g means "you're shaking it".
  let shake = sqrt(accelX * accelX + accelY * accelY);
  let kick = 0;
  if (shake > 1.4) { kick = (shake - 1.4) * 6; }   // scale into a usable range

  noStroke();
  for (let i = 0; i < N; i++) {
    let p = parts[i];

    // On a shake, jitter each particle randomly — that's the "explosion".
    if (kick > 0) {
      p.vx = p.vx + (random(-1, 1)) * kick;
      p.vy = p.vy + (random(-1, 1)) * kick;
    }

    // Drag (multiply by 0.94 each frame) + steady pull from gravity.
    p.vx = p.vx * 0.94 + accelX * 0.3;
    p.vy = p.vy * 0.94 + accelY * 0.3;

    // Integrate velocity.
    p.x = p.x + p.vx;
    p.y = p.y + p.vy;

    // Bounce off the screen edges.
    if (p.x < 10 || p.x > 230) { p.vx = -p.vx * 0.5; }
    if (p.y < 10 || p.y > 230) { p.vy = -p.vy * 0.5; }

    // Color cycles based on hue offset + time.
    let r = (((p.h + frameCount) * 1.4) % 240);
    let g = (((p.h + frameCount) * 0.6) % 240);
    fill(150 + r * 0.4, 100 + g * 0.5, 220);
    circle(p.x, p.y, 7);
  }
}
