// Particles drift away from gravity; tilt the device to push them.

let px = [], py = [], vx = [], vy = [];
let N = 60;

function setup() {
  for (let i = 0; i < N; i++) {
    px.push(120 + random(-50, 50));
    py.push(120 + random(-50, 50));
    vx.push(0);
    vy.push(0);
  }
}

function draw() {
  background(10, 10, 20);
  let gx = accelX * 0.4;
  let gy = accelY * 0.4;

  noStroke();
  for (let i = 0; i < N; i++) {
    vx[i] = vx[i] * 0.94 + gx;
    vy[i] = vy[i] * 0.94 + gy;
    px[i] = px[i] + vx[i];
    py[i] = py[i] + vy[i];
    if (px[i] < 10 || px[i] > 230) { vx[i] = -vx[i] * 0.6; }
    if (py[i] < 10 || py[i] > 230) { vy[i] = -vy[i] * 0.6; }
    let s = 4 + i * 0.05;
    fill(160 + i, 200 - i, 255 - i);
    circle(px[i], py[i], s);
  }
}
