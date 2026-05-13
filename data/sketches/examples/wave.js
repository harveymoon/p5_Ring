// wave.js — animated sine wave field
//
// Two overlapping sine waves of different frequencies and colors, with a
// white dot riding the top wave. The phase scrolls forever via frameCount.
//
// Demonstrates: for-loops, sin() for animation, multiple stroke colors,
// "scrolling" by reading frameCount.

function setup() {}

function draw() {
  // Dark plum background.
  background(10, 6, 24);

  // We're drawing 1-px points along the wave, so we use stroke (not fill).
  noFill();
  strokeWeight(2);

  // `t` is the time-phase. Bigger multiplier = faster motion.
  let t = frameCount * 0.04;

  // ── upper wave: cyan ──
  // Step across the screen 4 px at a time (cheaper than every pixel).
  // y = base + amplitude * sin(spatial_frequency * x + time_phase)
  stroke(120, 220, 255);
  for (let x = 0; x < 240; x = x + 4) {
    point(x, 110 + sin(x * 0.05 + t) * 30);
  }

  // ── lower wave: pink, different frequency, scrolls the other way ──
  stroke(255, 140, 180);
  for (let x = 0; x < 240; x = x + 4) {
    point(x, 150 + sin(x * 0.06 - t * 1.4) * 24);
  }

  // ── the ball rides the upper wave ──
  // It moves left-to-right and wraps around every 200 frames.
  let bx = 20 + ((frameCount * 1.5) % 200);
  let by = 110 + sin(bx * 0.05 + t) * 30;
  noStroke();
  fill(255);
  circle(bx, by, 8);
}
