// clock.js — analog clock showing time since boot
//
// Demonstrates nested rotate/push/pop transforms. The hour, minute, and
// second hands all start at the same origin and rotate by different
// amounts each frame. Push/pop isolate each hand's rotation so they
// don't compound.
//
// Note: this is uptime, not wall-clock time — millis() is "ms since the
// device booted", which resets to 0 on power-up. So at first plug-in the
// clock starts at 12.

function setup() {
  // A clock face is one of those rare cases where you DO want the canvas
  // to rotate with the device — so "up" on the dial always faces up.
  autoRotate();
}

function draw() {
  background(12, 8, 20);

  // Seconds elapsed since boot, as a float.
  let secs = millis() / 1000;

  // Move origin to the canvas center; every later coord is relative to it.
  push();
  translate(120, 120);

  // ── dial: outline + tick marks ──
  noFill();
  stroke(60, 80, 110);
  strokeWeight(2);
  circle(0, 0, 200);

  stroke(120, 160, 200);
  for (let i = 0; i < 12; i++) {
    push();
    rotate(i * (PI / 6));          // 12 hour-positions
    line(0, -95, 0, -85);          // a short tick near the rim
    pop();
  }

  // ── second hand: thin orange ──
  // 60 seconds = full rotation, so divide secs by 60.
  push();
  rotate(secs * (TWO_PI / 60));
  stroke(255, 160, 80);
  strokeWeight(2);
  line(0, 0, 0, -85);
  pop();

  // ── minute hand: thicker white ──
  push();
  rotate((secs / 60) * (TWO_PI / 60));
  stroke(220, 240, 255);
  strokeWeight(4);
  line(0, 0, 0, -65);
  pop();

  // ── hour hand: thickest, cyan ──
  push();
  rotate((secs / 3600) * (TWO_PI / 12));
  stroke(120, 200, 255);
  strokeWeight(5);
  line(0, 0, 0, -42);
  pop();

  // Center cap covers where all the hands meet.
  noStroke();
  fill(255);
  circle(0, 0, 8);

  pop();
}
