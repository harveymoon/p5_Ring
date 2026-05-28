// warp.js — hyperspace. Tilt to steer; bank hard to go faster.
// Stars project from a tilt-shifted vanishing point toward the viewer.
// Streak connects previous screen pos to current — pure demoscene warp.

let N = 30;
let xs  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let ys  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let zs  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let psx = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let psy = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

let _hx = 0;
let _hy = 0;

function setup() {
  noAutoRotate();
  let i;
  for (i = 0; i < N; i = i + 1) {
    zs[i] = (i + 1) * 7 + random(10);
    xs[i] = random(-100, 100);
    ys[i] = random(-100, 100);
    let sc = 200 / zs[i];
    psx[i] = (120 + xs[i] * sc) | 0;
    psy[i] = (120 + ys[i] * sc) | 0;
  }
}

function draw() {
  background(0);

  _hx = _hx * 0.88 + accelY * 0.12;
  _hy = _hy * 0.88 + accelX * 0.12;
  let hm = _hx * _hx + _hy * _hy;
  let spd = 4 + hm * 50;
  if (spd > 20) { spd = 20; }
  let cx = 120 + _hx * 80;
  let cy = 120 + _hy * 80;

  _sk(themeR, themeG, themeB);
  _sw(2);

  let i;
  let z;
  let sc;
  let sx;
  let sy;

  for (i = 0; i < N; i = i + 1) {
    z = zs[i] - spd;
    if (z < 2) {
      z = 170 + random(60);
      xs[i] = random(-100, 100);
      ys[i] = random(-100, 100);
      psx[i] = cx | 0;
      psy[i] = cy | 0;
    }
    zs[i] = z;
    sc = 200 / z;
    sx = (cx + xs[i] * sc) | 0;
    sy = (cy + ys[i] * sc) | 0;
    _ln(psx[i], psy[i], sx, sy);
    psx[i] = sx;
    psy[i] = sy;
  }
}
