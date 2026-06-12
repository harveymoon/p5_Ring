// rain.js — particle system, gravity-aware
//
// A simple "falling rain" effect. Each drop has a position (x, y), a
// downward velocity (vy), and a length. autoRotate() keeps the rain
// falling toward real-world down no matter how you hold the device.
//
// Demonstrates: arrays of small objects, setup-time initialization,
// per-frame state mutation, autoRotate().

let drops = [];   // array of drop objects, populated in setup()
let N = 35;   // reduced — the on-device interpreter has FFI overhead per call       // how many drops to simulate

function setup() {
  // Canvas tracks gravity — "down" on screen is always real-world down.
  autoRotate();

  // Pre-allocate every drop once (much cheaper than creating new objects
  // every frame inside draw()).
  for (let i = 0; i < N; i++) {
    drops.push({
      x: random(0, 240),
      y: random(0, 240),       // start scattered across the screen
      vy: random(2, 5),        // each drop falls at its own speed
      len: random(6, 16)       // and has its own visual length
    });
  }
}

function draw() {
  // Deep blue background — repaint each frame so old drops don't trail.
  background(6, 8, 18);

  // Light cyan strokes for the drops themselves.
  stroke(120, 200, 255, 180);
  strokeWeight(1);

  for (let i = 0; i < N; i++) {
    let d = drops[i];

    // Drops fall straight down on the rotated canvas.
    d.y = d.y + d.vy;

    // Each drop is a short vertical line.
//    line(d.x, d.y, d.x, d.y + d.len);
      fill(255);
      textSize(20);
      text('p',d.x, d.y);

    // Wrap around the bottom so the field never empties out.
    if (d.y > 240) { d.y = -10; d.x = random(0, 240); }
  }
}
