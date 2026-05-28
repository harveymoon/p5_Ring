// orb.js — a lit 3D sphere. Tilt to move the light across the surface.
// Mesh pre-computed in setup(). DL-cached by light-direction bucket.
// Live layer: specular highlight + orbiting particle drawn every frame.

let LB = 6;   // latitude bands
let LS = 8;   // longitude segments
let NF = 48;  // LB*LS faces
let SR = 106; // sphere radius px
let CX = 120;
let CY = 120;

// Vertex projected positions and normals — (LB+1)*LS = 56 entries
let VPX=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let VPY=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let VNX=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let VNY=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let VNZ=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

// Face normals and quad vertex indices — NF=48 entries
let FNX=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let FNY=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let FNZ=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let FA =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let FB =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let FC =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let FD =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

let _dlBucket = -1;
let _dlReady  = 0;
let _lx = 0;
let _ly = 0;
let _lz = 1;

function setup() {
  noAutoRotate();

  // Trig tables to avoid recomputing sin/cos per vertex
  let sL=[0,0,0,0,0,0,0];
  let cL=[0,0,0,0,0,0,0];
  let sO=[0,0,0,0,0,0,0,0];
  let cO=[0,0,0,0,0,0,0,0];
  let k;
  for (k = 0; k <= LB; k = k + 1) {
    let th = k * PI / LB;
    sL[k] = sin(th);
    cL[k] = cos(th);
  }
  for (k = 0; k < LS; k = k + 1) {
    let ph = k * TWO_PI / LS;
    sO[k] = sin(ph);
    cO[k] = cos(ph);
  }

  // Vertices: unit-sphere position = normal; project orthographically
  let j;
  for (k = 0; k <= LB; k = k + 1) {
    for (j = 0; j < LS; j = j + 1) {
      let v = k * LS + j;
      let nx = sL[k] * cO[j];
      let ny = cL[k];
      let nz = sL[k] * sO[j];
      VNX[v] = nx;  VNY[v] = ny;  VNZ[v] = nz;
      VPX[v] = (CX + nx * SR) | 0;
      VPY[v] = (CY - ny * SR) | 0;
    }
  }

  // Quad faces: each stores 4 corner indices + averaged face normal
  let f = 0;
  for (k = 0; k < LB; k = k + 1) {
    for (j = 0; j < LS; j = j + 1) {
      let j1 = j + 1; if (j1 >= LS) { j1 = 0; }
      let va = k * LS + j;
      let vb = k * LS + j1;
      let vc = (k + 1) * LS + j;
      let vd = (k + 1) * LS + j1;
      FA[f] = va;  FB[f] = vb;  FC[f] = vc;  FD[f] = vd;
      FNX[f] = (VNX[va]+VNX[vb]+VNX[vc]+VNX[vd]) * 0.25;
      FNY[f] = (VNY[va]+VNY[vb]+VNY[vc]+VNY[vd]) * 0.25;
      FNZ[f] = (VNZ[va]+VNZ[vb]+VNZ[vc]+VNZ[vd]) * 0.25;
      f = f + 1;
    }
  }
}

function draw() {
  // Light direction from accelerometer. accelY tilts left/right → light left/right.
  let rlx = accelY;
  let rly = accelX;
  let rlz = 0.7;
  let lm  = sqrt(rlx*rlx + rly*rly + rlz*rlz);
  if (lm < 0.001) { lm = 0.001; }
  _lx = rlx / lm;
  _ly = rly / lm;
  _lz = rlz / lm;

  // Bucket by light direction (10x10 grid)
  let bx = (_lx * 4 + 5) | 0;  if (bx < 0) { bx = 0; }  if (bx > 9) { bx = 9; }
  let by = (_ly * 4 + 5) | 0;  if (by < 0) { by = 0; }  if (by > 9) { by = 9; }
  let bucket = bx + by * 10;

  if (bucket !== _dlBucket || !_dlReady) {
    _dlBucket = bucket;
    dlRecord();
    _bg(2, 4, 12);
    _ns();
    let f;
    for (f = 0; f < NF; f = f + 1) {
      if (FNZ[f] > 0) {
        let dot = FNX[f]*_lx + FNY[f]*_ly + FNZ[f]*_lz;
        if (dot < 0) { dot = 0; }
        let br = 0.07 + dot * dot * 0.93;
        let cr = (themeR * br) | 0;
        let cg = (themeG * br) | 0;
        let cb = (themeB * br) | 0;
        if (cr > 255) { cr = 255; }
        if (cg > 255) { cg = 255; }
        if (cb > 255) { cb = 255; }
        _fl(cr, cg, cb);
        let va = FA[f];  let vb = FB[f];  let vc = FC[f];  let vd = FD[f];
        _tr(VPX[va], VPY[va], VPX[vb], VPY[vb], VPX[vd], VPY[vd]);
        _tr(VPX[va], VPY[va], VPX[vd], VPY[vd], VPX[vc], VPY[vc]);
      }
    }
    dlEnd();
    _dlReady = 1;
  }

  dlPlay();

  // Live: specular starburst at the lit point — lines only, no fill
  let sx = (CX + _lx * SR * 0.45) | 0;
  let sy = (CY - _ly * SR * 0.45) | 0;
  _sw(3);
  _ska(255, 255, 255, 240);
  _ln(sx - 9, sy, sx + 9, sy);
  _ln(sx, sy - 9, sx, sy + 9);
  _ln(sx - 6, sy - 6, sx + 6, sy + 6);
  _ln(sx - 6, sy + 6, sx + 6, sy - 6);
  _sw(1);
  _ska(themeR, themeG, themeB, 180);
  _ln(sx - 14, sy, sx + 14, sy);
  _ln(sx, sy - 14, sx, sy + 14);

  // Live: orbiting particle — small cross that laps the sphere
  let oa = frameCount * 0.04;
  let ox = (CX + cos(oa) * (SR + 14)) | 0;
  let oy = (CY + sin(oa) * (SR + 14)) | 0;
  _ska(200, 220, 255, 220);
  _sw(2);
  _ln(ox - 3, oy, ox + 3, oy);
  _ln(ox, oy - 3, ox, oy + 3);
}
