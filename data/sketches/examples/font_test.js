// font_test.js — same string at every available text size, rows scroll upward.
// textSize() maps to LovyanGFX integer scale = n/8, clamped to 8..48 px.
// That yields 6 distinct sizes: 8, 16, 24, 32, 40, 48.

let msg = "Wo ai ni";
let N = 6;
let sizes =  [8,  16, 24, 32, 40, 48];
let heights = [16, 24, 32, 40, 48, 56];  // size + 8px breathing room
let rowY = [0, 0, 0, 0, 0, 0];
let totalH = 0;
let scroll = 0;
let SPEED = 0.5;

function setup() {
  noAutoRotate();
  textAlign(CENTER);
  let y = 10;
  let i;
  for (i = 0; i < N; i = i + 1) {
    rowY[i] = y;
    y = y + heights[i];
  }
  totalH = y;
}

function draw() {
  background(8, 10, 18);
  noStroke();
  textAlign(CENTER);

  let i;
  for (i = 0; i < N; i = i + 1) {
    let y = rowY[i] - scroll;
    if (y < 0 - heights[i]) {
      y = y + totalH;
    }
    if (y > 0 - heights[i] && y < 250) {
      let t = i / (N - 1);
      let r = (themeR + (255 - themeR) * t) | 0;
      let g = (themeG + (255 - themeG) * t) | 0;
      let b = (themeB + (255 - themeB) * t) | 0;
      fill(r, g, b);
      textSize(sizes[i]);
      text(msg, 120, y);
    }
  }

  scroll = scroll + SPEED;
  if (scroll >= totalH) {
    scroll = scroll - totalH;
  }
}
