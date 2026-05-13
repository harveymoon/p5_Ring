// sensors.js — feature showcase
//
// Demonstrates: drawing primitives, transforms (push/pop/translate), text,
// accelerometer readouts, and live frameCount. Tilt the device while it
// runs — the arrow tracks gravity and the numbers update in real time.
//
// Note: this sketch does NOT call autoRotate(), so the canvas stays
// pinned upright on screen. The arrow alone moves to show direction.

function setup() {}

function draw() {
  background(8, 10, 18);

  // Light-blue crosshair — visual reference for the center of the screen.
  stroke(40, 80, 110);
  strokeWeight(1);
  line(0, 120, 240, 120);   // horizontal
  line(120, 0, 120, 240);   // vertical

  // ─── tilt arrow ───
  // Move origin to center so positive accelX = right, positive accelY = down.
  push();
  translate(width / 2, height / 2);
  let ax = accelX * 70;             // scale up by 70 for visibility
  let ay = accelY * 70;
  stroke(255, 200, 80);
  strokeWeight(3);
  line(0, 0, ax, ay);               // shaft of the arrow
  noStroke();
  fill(255, 220, 130);
  circle(ax, ay, 12);               // arrowhead (just a dot for simplicity)
  fill(255);
  circle(ax + 3, ay - 3, 4);        // tiny highlight to give it shape
  pop();

  // ─── orbit of small dots ───
  // Six dots evenly spaced around a circle, all rotating together.
  push();
  translate(width / 2, height / 2);
  noStroke();
  for (let i = 0; i < 6; i++) {
    let a = frameCount * 0.03 + i * 1.0472;   // 1.0472 ≈ 60°
    fill(80 + i * 25, 200, 255);              // gradient blue
    circle(cos(a) * 95, sin(a) * 95, 7);
  }
  pop();

  // ─── live readout text ───
  // mJS forbids "string + number" implicit concatenation, so wrap each
  // number with str(). round(x*100)/100 gives 2-decimal display.
  fill(220, 230, 240);
  textSize(8);
  textAlign(LEFT);
  text("accelX " + str(round(accelX * 100) / 100), 70, 38);
  text("accelY " + str(round(accelY * 100) / 100), 70, 50);
  text("accelZ " + str(round(accelZ * 100) / 100), 70, 62);

  textAlign(CENTER);
  text("frame " + str(frameCount), 120, 205);
}
