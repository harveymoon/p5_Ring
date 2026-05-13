// Perlin-noise blob — slow shape morph around a center.

function setup() {}

function draw() {
  background(5, 5, 20);
  noStroke();
  fill(80, 220, 200);
  let t = frameCount * 0.01;
  let cx = width / 2;
  let cy = height / 2;
  let prevX = 0, prevY = 0;
  let n = 60;
  for (let i = 0; i <= n; i++) {
    let a = (i / n) * TWO_PI;
    let r = 60 + noise(cos(a) + t, sin(a) + t, 0) * 40;
    let x = cx + cos(a) * r;
    let y = cy + sin(a) * r;
    if (i > 0) {
      triangle(cx, cy, prevX, prevY, x, y);
    }
    prevX = x;
    prevY = y;
  }
}
