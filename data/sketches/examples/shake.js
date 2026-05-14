// shake.js — bouncing balls in a circular arena
//
// Tilt to roll the balls around (gravity follows tilt). Shake the device
// and all of them jolt at once. They reflect off the round wall with some
// energy loss.
//
// Demonstrates: a useful "shake event" pattern — compare the current
// accelerometer reading against the previous frame's, and trigger when
// the change (jerk) crosses a threshold. This avoids false positives
// from steady gravity, which the previous version of this sketch had.

let balls = [];
let N = 12;             // small enough to stay smooth on the on-device VM
let prevAX = 0;         // last frame's accel — used to detect shake
let prevAY = 0;

function setup() {
  // Scatter balls evenly around a small ring near the center.
  for (let i = 0; i < N; i++) {
    let a = i * (TWO_PI / N);
    balls.push({
      x: 120 + cos(a) * 40,
      y: 120 + sin(a) * 40,
      vx: 0,
      vy: 0
    });
  }
}

function draw() {
  background(8, 8, 18);

  // Faint ring marking the arena boundary.
  noFill();
  stroke(themeR / 5, themeG / 5, themeB / 5);
  strokeWeight(1);
  circle(120, 120, 220);

  // Shake detection: how much did the accel vector move since last frame?
  // Steady gravity gives ~0 here; only real motion (jerk) crosses the gate.
  let jerk = abs(accelX - prevAX) + abs(accelY - prevAY);
  prevAX = accelX;
  prevAY = accelY;
  let kick = 0;
  if (jerk > 0.5) { kick = jerk * 5; }

  noStroke();
  fill(themeR, themeG, themeB);

  for (let i = 0; i < N; i++) {
    let b = balls[i];

    // On a real shake, give every ball a random impulse.
    if (kick > 0) {
      b.vx = b.vx + (random(-1, 1)) * kick;
      b.vy = b.vy + (random(-1, 1)) * kick;
    }

    // Gravity from the tilt vector + friction.
    b.vx = b.vx * 0.95 + accelX * 0.5;
    b.vy = b.vy * 0.95 + accelY * 0.5;

    // Integrate position.
    b.x = b.x + b.vx;
    b.y = b.y + b.vy;

    // Reflect off the circular wall (radius 105 from center).
    let dx = b.x - 120;
    let dy = b.y - 120;
    let d2 = dx * dx + dy * dy;
    if (d2 > 105 * 105) {
      let d = sqrt(d2);
      // Snap back inside the boundary.
      b.x = 120 + dx * 105 / d;
      b.y = 120 + dy * 105 / d;
      // Reflect velocity across the wall normal, with 60% restitution.
      let dot = (b.vx * dx + b.vy * dy) / d2;
      b.vx = (b.vx - 2 * dot * dx) * 0.6;
      b.vy = (b.vy - 2 * dot * dy) * 0.6;
    }

    circle(b.x, b.y, 12);
  }
}
