// diamond.js — 16-fold brilliant cut, chromatic fire, IMU shading, sparkles.

let CX = 120, CY = 120, N = 16, R_TABLE = 52, R_GIRDLE = 128;

// 16-fold cos/sin × 100 at 0°, 22.5°, 45°, ..., 337.5°
let C8 = [100, 92, 71, 38, 0, -38, -71, -92, -100, -92, -71, -38, 0, 38, 71, 92];
let S8 = [0, 38, 71, 92, 100, 92, 71, 38, 0, -38, -71, -92, -100, -92, -71, -38];

// Face normals for each star facet — halfway between adjacent vertices
let NX = [98, 83, 55, 19, -19, -55, -83, -98, -98, -83, -55, -19, 19, 55, 83, 98];
let NY = [19, 55, 83, 98, 98, 83, 55, 19, -19, -55, -83, -98, -98, -83, -55, -19];

let TX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let TY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let GX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let GY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let HX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let HY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let TS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

let _dlBucket = -1;
let _dlReady = 0;

function setup() {
  noAutoRotate();
  let k;
  for (k = 0; k < N; k = k + 1) {
    TX[k] = (CX + (R_TABLE  * C8[k]) / 100) | 0;
    TY[k] = (CY + (R_TABLE  * S8[k]) / 100) | 0;
    GX[k] = (CX + (R_GIRDLE * C8[k]) / 100) | 0;
    GY[k] = (CY + (R_GIRDLE * S8[k]) / 100) | 0;
  }
  for (k = 0; k < N; k = k + 1) {
    let k1 = k + 1;
    if (k1 >= N) { k1 = 0; }
    HX[k] = (GX[k] + GX[k1]) / 2 | 0;
    HY[k] = (GY[k] + GY[k1]) / 2 | 0;
  }
}

function draw() {
  let bx = (accelX * 10 + 10) | 0; if (bx < 0) { bx = 0; } if (bx > 19) { bx = 19; }
  let by = (accelY * 10 + 10) | 0; if (by < 0) { by = 0; } if (by > 19) { by = 19; }
  let bucket = bx + by * 20;
  if (bucket === _dlBucket && _dlReady) { dlPlay(); return; }
  _dlBucket = bucket; dlRecord();

  _bg(8, 10, 18);

  let lx = (accelX * 96 + accelY * 115) | 0;
  let ly = (0 - accelX * 115 + accelY * 96) | 0;

  let k;
  for (k = 0; k < N; k = k + 1) {
    let k1 = k + 1;
    if (k1 >= N) { k1 = 0; }
    _ns();

    // Left girdle — two triangles spanning TX[k..k1] to GX[k..k1]
    let dotL = C8[k] * lx + S8[k] * ly;
    let tL = (dotL + 15000) / 30000;
    if (tL < 0.0) { tL = 0.0; } if (tL > 1.0) { tL = 1.0; }
    let bL = tL * tL;
    let rL = ((themeR + (255 - themeR) * tL) * bL) | 0;
    let gL = ((themeG + (255 - themeG) * tL) * bL) | 0;
    let vL = ((themeB + (255 - themeB) * tL) * bL) | 0;
    if (rL > 255) { rL = 255; } if (gL > 255) { gL = 255; } if (vL > 255) { vL = 255; }
    _fl(rL, gL, vL);
    _tr(TX[k], TY[k], TX[k1], TY[k1], GX[k1], GY[k1]);
    _tr(TX[k], TY[k], GX[k1], GY[k1], GX[k], GY[k]);

    // Star facet — face-normal shading + chromatic fire (dispersion)
    let dotS = NX[k] * lx + NY[k] * ly;
    let tS = (dotS + 15000) / 30000;
    if (tS < 0.0) { tS = 0.0; } if (tS > 1.0) { tS = 1.0; }
    TS[k] = tS;
    let bS = tS * tS;
    let rS = ((themeR + (255 - themeR) * tS) * bS) | 0;
    let gS = ((themeG + (255 - themeG) * tS) * bS) | 0;
    let vS = ((themeB + (255 - themeB) * tS) * bS) | 0;
    let fire = ((tS - 0.45) * 140) | 0;
    if (fire > 0) {
      rS = rS + ((NX[k] * fire) / 100) | 0;
      vS = vS - ((NX[k] * fire) / 100) | 0;
      if (rS < 0) { rS = 0; } if (rS > 255) { rS = 255; }
      if (vS < 0) { vS = 0; } if (vS > 255) { vS = 255; }
    }
    if (gS > 255) { gS = 255; }
    _fl(rS, gS, vS);
    _tr(TX[k], TY[k], TX[k1], TY[k1], HX[k], HY[k]);

    // Right girdle kite
    let dotR = C8[k1] * lx + S8[k1] * ly;
    let tR = (dotR + 15000) / 30000;
    if (tR < 0.0) { tR = 0.0; } if (tR > 1.0) { tR = 1.0; }
    let bR = tR * tR;
    let rR = ((themeR + (255 - themeR) * tR) * bR) | 0;
    let gR = ((themeG + (255 - themeG) * tR) * bR) | 0;
    let vR = ((themeB + (255 - themeB) * tR) * bR) | 0;
    if (rR > 255) { rR = 255; } if (gR > 255) { gR = 255; } if (vR > 255) { vR = 255; }
    _fl(rR, gR, vR);
    _tr(TX[k1], TY[k1], GX[k1], GY[k1], HX[k], HY[k]);

    // Star sparkle
    if (tS > 0.82 && _rn(0, 1) > 0.72) {
      let p1 = _rn(0, 1); let p2 = _rn(0, 1);
      if (p1 + p2 > 1.0) { p1 = 1.0 - p1; p2 = 1.0 - p2; }
      let spx = (TX[k] + p1 * (TX[k1] - TX[k]) + p2 * (HX[k] - TX[k])) | 0;
      let spy = (TY[k] + p1 * (TY[k1] - TY[k]) + p2 * (HY[k] - TY[k])) | 0;
      _ska(255, 255, 255, 220);
      _ln(spx - 2, spy, spx + 2, spy);
      _ln(spx, spy - 2, spx, spy + 2);
    }

    // Left girdle sparkle
    if (tL > 0.84 && _rn(0, 1) > 0.75) {
      let q1 = _rn(0, 1); let q2 = _rn(0, 1);
      if (q1 + q2 > 1.0) { q1 = 1.0 - q1; q2 = 1.0 - q2; }
      let sqx = (TX[k] + q1 * (HX[k] - TX[k]) + q2 * (GX[k] - TX[k])) | 0;
      let sqy = (TY[k] + q1 * (HY[k] - TY[k]) + q2 * (GY[k] - TY[k])) | 0;
      _ska(255, 255, 255, 220);
      _ln(sqx - 2, sqy, sqx + 2, sqy);
      _ln(sqx, sqy - 2, sqx, sqy + 2);
    }
  }

  // Pavilion — TIR: opposite crown facet brightness seen through table
  _ns();
  for (k = 0; k < N; k = k + 1) {
    let k1 = k + 1;
    if (k1 >= N) { k1 = 0; }
    let kp = k + 8; if (kp >= N) { kp = kp - N; }
    let tP = TS[kp] * 0.7;
    if (tP < 0.0) { tP = 0.0; }
    let bP = tP * tP;
    let rP = ((themeR + (255 - themeR) * tP) * bP) | 0;
    let gP = ((themeG + (255 - themeG) * tP) * bP) | 0;
    let vP = ((themeB + (255 - themeB) * tP) * bP) | 0;
    let fireP = ((tP - 0.45) * 100) | 0;
    if (fireP > 0) {
      rP = rP + ((NX[kp] * fireP) / 100) | 0;
      vP = vP - ((NX[kp] * fireP) / 100) | 0;
      if (rP < 0) { rP = 0; } if (rP > 255) { rP = 255; }
      if (vP < 0) { vP = 0; } if (vP > 255) { vP = 255; }
    }
    if (gP > 255) { gP = 255; }
    _fl(rP, gP, vP);
    _tr(CX, CY, TX[k], TY[k], TX[k1], TY[k1]);
  }
  // Culet sparkle
  if (_rn(0, 1) > 0.88) {
    _ska(255, 255, 255, 240);
    _ln(CX - 3, CY, CX + 3, CY);
    _ln(CX, CY - 3, CX, CY + 3);
  }

  // Vertex sparkles — 8-pointed stars on bright girdle and midpoints
  for (k = 0; k < N; k = k + 1) {
    let k1 = k + 1;
    if (k1 >= N) { k1 = 0; }
    let dotV = C8[k] * lx + S8[k] * ly;
    let tV = (dotV + 15000) / 30000;
    if (tV < 0.0) { tV = 0.0; } if (tV > 1.0) { tV = 1.0; }
    let tM = TS[k];

    if (tV > 0.90 && _rn(0, 1) > 0.55) {
      _ska(255, 255, 255, 240);
      _ln(GX[k] - 8, GY[k], GX[k] + 8, GY[k]);
      _ln(GX[k], GY[k] - 8, GX[k], GY[k] + 8);
      _ln(GX[k] - 6, GY[k] - 6, GX[k] + 6, GY[k] + 6);
      _ln(GX[k] - 6, GY[k] + 6, GX[k] + 6, GY[k] - 6);
    }
    if (tM > 0.90 && _rn(0, 1) > 0.55) {
      _ska(255, 255, 255, 230);
      _ln(HX[k] - 6, HY[k], HX[k] + 6, HY[k]);
      _ln(HX[k], HY[k] - 6, HX[k], HY[k] + 6);
      _ln(HX[k] - 4, HY[k] - 4, HX[k] + 4, HY[k] + 4);
      _ln(HX[k] - 4, HY[k] + 4, HX[k] + 4, HY[k] - 4);
    }
  }

  dlEnd();
  _dlReady = 1;
}
