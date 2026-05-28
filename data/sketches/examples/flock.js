// flock.js — murmuration. Tilt steers the whole flock.
// Ghost cohesion (k=0.010) pulls birds together toward a Lissajous target.
// Centroid repulsion (k=0.006) pushes them away from the flock's own center.
// The two forces balance into a loose, self-maintaining cloud — no rigid slots.

let N = 14;
let xs  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let ys  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let vxs = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let vys = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];

let _gxB  = 120;
let _gyB  = 120;
let _gTick = 0;
let _cmx  = 120;
let _cmy  = 120;

function setup() {
  noAutoRotate();
  let i;
  for (i = 0; i < N; i = i + 1) {
    xs[i]  = 70 + random(100);
    ys[i]  = 70 + random(100);
    vxs[i] = random(-1, 1);
    vys[i] = random(-1, 1);
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

  _sk(themeR, themeG, themeB);
  _sw(2);

  let i;
  let ax;
  let ay;
  let xi;
  let yi;
  let vxi;
  let vyi;
  let sumX = 0;
  let sumY = 0;
  for (i = 0; i < N; i = i + 1) {
    xi  = xs[i];
    yi  = ys[i];
    vxi = vxs[i];
    vyi = vys[i];

    ax = (gx - xi) * 0.010 + (xi - _cmx) * 0.006 + aY * 0.08;
    ay = (gy - yi) * 0.010 + (yi - _cmy) * 0.006 + aX * 0.08;

    vxi = (vxi + ax) * 0.92;
    vyi = (vyi + ay) * 0.92;

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

    sumX = sumX + xi;
    sumY = sumY + yi;

    _ln(xi, yi, xi + vxi * 3, yi + vyi * 3);
  }
  _cmx = sumX * 0.0715;
  _cmy = sumY * 0.0715;
}
