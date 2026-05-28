// flock.js — murmuration. Tilt steers the whole flock. ~20fps.
// Birds chase a ghost that traces a Lissajous path + tilt offset.
// No O(N²) pair-checks — pure global cohesion keeps it fast.
// accelX/Y cached before loop; loop vars hoisted; ghost trig cached every 3 frames.

let N = 10;

let xs  = [0,0,0,0,0,0,0,0,0,0];
let ys  = [0,0,0,0,0,0,0,0,0,0];
let vxs = [0,0,0,0,0,0,0,0,0,0];
let vys = [0,0,0,0,0,0,0,0,0,0];

let _gxB  = 120;
let _gyB  = 120;
let _gTick = 0;

function setup() {
  noAutoRotate();
  let i;
  for (i = 0; i < N; i = i + 1) {
    xs[i]  = random(40, 200);
    ys[i]  = random(40, 200);
    vxs[i] = random(-2, 2);
    vys[i] = random(-2, 2);
  }
}

function draw() {
  background(0);

  // Ghost: Lissajous base sampled every 3 frames, tilt applied live
  _gTick = _gTick + 1;
  if (_gTick >= 3) {
    _gTick = 0;
    let t = frameCount;
    _gxB = 120 + sin(t * 0.023) * 68;
    _gyB = 120 + sin(t * 0.031) * 68;
  }
  // Cache accel FFI reads — accessed N times below; cache to locals saves ~10ms
  let aY = accelY;
  let aX = accelX;
  let gx = _gxB + aY * 45;
  let gy = _gyB + aX * 45;

  _sk(themeR, themeG, themeB);
  _sw(2);

  // All loop vars hoisted — avoids per-iteration binding allocation in mJS
  let i;
  let ax;
  let ay;
  let xi;
  let yi;
  let vxi;
  let vyi;
  for (i = 0; i < N; i = i + 1) {
    xi  = xs[i];
    yi  = ys[i];
    vxi = vxs[i];
    vyi = vys[i];

    ax  = (gx - xi) * 0.006 + aY * 0.15;
    ay  = (gy - yi) * 0.006 + aX * 0.15;

    vxi = (vxi + ax) * 0.96;
    vyi = (vyi + ay) * 0.96;

    xi = xi + vxi;
    yi = yi + vyi;

    if (xi < 0)   { xi = xi + 240; }
    if (xi > 240) { xi = xi - 240; }
    if (yi < 0)   { yi = yi + 240; }
    if (yi > 240) { yi = yi - 240; }

    xs[i]  = xi;
    ys[i]  = yi;
    vxs[i] = vxi;
    vys[i] = vyi;

    _ln(xi, yi, xi + vxi * 6, yi + vyi * 6);
  }
}
