// shapes.js — pure-drawing demo
//
// Shows off all the primitives + nested transforms (push/pop, rotate).
// No sensor input, no autoRotate — the artwork stays put no matter how
// you hold the device. A good template if you want to design a fixed
// composition that doesn't react to tilt.

function setup() {
  // Nothing to set up — defaults are fine (width=height=240, no fill alpha).
}

function draw() {
  // Repaint each frame so we don't accumulate trails.
  background(10, 8, 22);

  // Save the current transform, then move the origin to the canvas center.
  // After this point, (0,0) means "middle of the screen".
  push();
  translate(120, 120);

  // A slowly-advancing time variable used to drive rotations.
  let t = frameCount * 0.012;

  // Outer ring — stroke only (noFill), 1 px wide cyan circle, 200 px wide.
  noFill();
  stroke(80, 160, 220, 180);   // 4th arg is alpha (approximated on device)
  strokeWeight(1);
  circle(0, 0, 200);

  // Petals: 8 ellipses arranged in a ring, each rotated 45° from the last.
  // Each iteration we push/rotate/draw/pop so the rotation doesn't carry
  // over to the next iteration.
  for (let i = 0; i < 8; i++) {
    push();
    rotate(t + i * (PI / 4));               // 8 evenly spaced angles
    noStroke();
    fill(120 + i * 14, 100 + i * 16, 220);  // gradient blue-purple
    ellipse(0, -60, 30, 60);                // petal: 30 wide, 60 tall, 60 px out
    pop();
  }

  // Counter-rotating ring of 6 triangles, spinning the other way.
  for (let i = 0; i < 6; i++) {
    push();
    rotate(-t * 1.5 + i * (PI / 3));
    fill(255, 180, 80);
    noStroke();
    triangle(0, -36, -8, -22, 8, -22);      // small upward triangle
    pop();
  }

  // Center triangle, spinning faster than the others.
  push();
  rotate(t * 2.2);
  fill(255, 220, 100);
  noStroke();
  triangle(0, -16, -14, 10, 14, 10);
  pop();

  // Four tiny white dots at the cardinal directions (top/right/bottom/left).
  noStroke();
  fill(220, 240, 255);
  for (let i = 0; i < 4; i++) {
    push();
    rotate(i * HALF_PI);   // 0, 90, 180, 270 degrees
    circle(0, -88, 4);     // dot 88 px from center
    pop();
  }

  // Restore the original (un-translated) transform.
  pop();
}
