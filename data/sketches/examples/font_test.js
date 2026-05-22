// font_test.js — same string at 10 sizes, rows scroll upward in a loop.

let msg = "Wo ai ni";
let N = 10;
let rowY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let totalH = 0;
let scroll = 0;
let SPEED = 0.6;

function setup() {
  noAutoRotate();
  textAlign(CENTER);
  let y = 20;
  let i;
  for (i = 0; i < N; i = i + 1) {
    rowY[i] = y;
    y = y + (i + 1) * 8 + 8;
  }
  totalH = y;
}

function draw() {
  background(8, 10, 18);
  noStroke();
  fill(themeR, themeG, themeB);

  let i;
  for (i = 0; i < N; i = i + 1) {
    let y = rowY[i] - scroll;
    if (y < 0 - (i + 1) * 8) {
      y = y + totalH;
    }
    if (y > 0 - (i + 1) * 8 && y < 250) {
      textSize(i + 1);
      text(msg, 120, y);
    }
  }

  scroll = scroll + SPEED;
  if (scroll >= totalH) {
    scroll = scroll - totalH;
  }
}
