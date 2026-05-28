// flock.js — murmuration. Tilt steers the whole flock.
// 12 birds each own a slot in a rotating ring that chases a Lissajous ghost.
// The ring spins slowly (~13s/rev), so birds arc around the ghost while it
// traces a figure-8 path. No per-bird trig — cos/sin computed once per frame.

let N = 12;
let xs  = [0,0,0,0,0,0,0,0,0,0,0,0];
let ys  = [0,0,0,0,0,0,0,0,0,0,0,0];
let vxs = [0,0,0,0,0,0,0,0,0,0,0,0];
let vys = [0,0,0,0,0,0,0,0,0,0,0,0];

// Ring of radius 35, 12 birds at 30° intervals
// DX[i] = round(35*cos(i*30°)), DY[i] = round(35*sin(i*30°))
let DX = [35, 30, 18,  0, -18, -30, -35, -30, -18,   0,  18,  30];
let DY = [ 0, 18, 30, 35,  30,  18,   0, -18, -30, -35, -30, -18];

let _gxB  = 120;
let _gyB  = 120;
let _gTick = 0;
let _ra   = 0;

function setup() {
  noAutoRotate();
  let i;
  for (i = 0; i < N; i = i + 1) {
    xs[i]  = 120 + DX[i];
    ys[i]  = 120 + DY[i];
    vxs[i] = random(-0.5, 0.5);
    vys[i] = random(-0.5, 0.5);
  }
}

function draw() {
  background(0);

  _gTick = _gTick + 1;
  if (_gTick >= 3) {
    _gTick = 0;
    let t = frameCount;
    _gxB = 120 + sin(t * 0.023) * 50;
    _gyB = 120 + sin(t * 0.031) * 50;
  }
  let aY = accelY;
  let aX = accelX;
  let gx = _gxB + aY * 30;
  let gy = _gyB + aX * 30;

  _ra = _ra + 0.03;
  let cr = cos(_ra);
  let sr = sin(_ra);

  _sk(themeR, themeG, themeB);
  _sw(2);

  let i;
  let ax;
  let ay;
  let xi;
  let yi;
  let vxi;
  let vyi;
  let txi;
  let tyi;
  for (i = 0; i < N; i = i + 1) {
    xi  = xs[i];
    yi  = ys[i];
    vxi = vxs[i];
    vyi = vys[i];

    txi = gx + DX[i] * cr - DY[i] * sr;
    tyi = gy + DX[i] * sr + DY[i] * cr;
    ax  = (txi - xi) * 0.008 + aY * 0.08;
    ay  = (tyi - yi) * 0.008 + aX * 0.08;

    vxi = (vxi + ax) * 0.88;
    vyi = (vyi + ay) * 0.88;

    xi = xi + vxi;
    yi = yi + vyi;

    if (xi < 5)   { xi = 5;   vxi = -vxi * 0.5; }
    if (xi > 235) { xi = 235; vxi = -vxi * 0.5; }
    if (yi < 5)   { yi = 5;   vyi = -vyi * 0.5; }
    if (yi > 235) { yi = 235; vyi = -vyi * 0.5; }

    xs[i]  = xi;
    ys[i]  = yi;
    vxs[i] = vxi;
    vys[i] = vyi;

    _ln(xi, yi, xi + vxi * 3, yi + vyi * 3);
  }
}
