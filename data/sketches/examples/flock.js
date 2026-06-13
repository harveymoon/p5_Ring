// flock.js — murmuration. Tilt steers the whole flock.
//
// Each bird homes toward its OWN offset slot near a drifting Lissajous target,
// so the flock is a loose cloud of distinct birds instead of one dot. The slot
// cloud slowly rotates (a gentle swirl) and every bird gets an independent
// per-frame random kick, so no two birds move alike and they never collapse
// onto the same point.

let N = 14;
let xs  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let ys  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let vxs = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let vys = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let oxs = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];   // per-bird offset from the flock target
let oys = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];

let _gxB = 120;
let _gyB = 120;
let _gTick = 0;

function setup() {
  noAutoRotate();
  let i;
  for (i = 0; i < N; i = i + 1) {
    xs[i]  = 70 + random(100);
    ys[i]  = 70 + random(100);
    vxs[i] = random(-1, 1);
    vys[i] = random(-1, 1);
    // Unique slot in the cloud — this is what keeps the birds apart.
    oxs[i] = random(-45, 45);
    oys[i] = random(-45, 45);
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

  // Rotate the whole slot cloud a touch each frame so the formation swirls
  // instead of flying around as a frozen blob. Computed once, used by all birds.
  let rc = cos(0.012);
  let rs = sin(0.012);

  _sk(themeR, themeG, themeB);
  _sw(2);

  let i;
  let ax;
  let ay;
  let xi;
  let yi;
  let vxi;
  let vyi;
  let oxi;
  let oyi;
  for (i = 0; i < N; i = i + 1) {
    xi  = xs[i];
    yi  = ys[i];
    vxi = vxs[i];
    vyi = vys[i];

    // Advance this bird's slot by the shared rotation.
    oxi = oxs[i];
    oyi = oys[i];
    oxs[i] = oxi * rc - oyi * rs;
    oys[i] = oxi * rs + oyi * rc;

    // Home toward (target + own slot), + tilt drift, + independent jitter.
    ax = (gx + oxs[i] - xi) * 0.011 + aY * 0.08 + random(-0.7, 0.7);
    ay = (gy + oys[i] - yi) * 0.011 + aX * 0.08 + random(-0.7, 0.7);

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

    _ln(xi, yi, xi + vxi * 3, yi + vyi * 3);
  }
}
