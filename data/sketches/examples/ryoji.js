// ryoji.js — after the data-art of Ryoji Ikeda.
// Barcode is DL-cached and re-recorded every 10 frames.
// Scan lines, read-head, flash, brackets draw live each frame.

let _dlReady = 0;

function draw() {
  let t = frameCount;

  // Barcode + rules: background is inside the DL so dlPlay() gets a clean slate
  if (t % 10 === 0 || !_dlReady) {
    _dlReady = 1;
    dlRecord();
    background(0);
    fill(255);
    noStroke();
    for (let i = 0; i < 30; i = i + 1) {
      if (random(1) > 0.5) {
        let x = i * 8;
        _tr(x, 0, x+7, 0, x+7, 240);
        _tr(x, 0, x+7, 240, x, 240);
      }
    }
    stroke(0);
    strokeWeight(1);
    for (let y = 0; y < 240; y = y + 40) {
      line(0, y, 240, y);
    }
    dlEnd();
  } else {
    dlPlay();
  }

  // Full-frame flash: 1 white frame every 30
  if (t % 30 === 0) {
    noStroke();
    fill(255);
    rect(0, 0, 240, 240);
  }

  // Flashing center box: 2 frames on per 14-frame cycle
  if (t % 14 < 2) {
    fill(0);
    stroke(255);
    strokeWeight(1);
    rect(80, 80, 80, 80);
  }

  // Four scan lines at different speeds — interference patterns
  stroke(255);
  strokeWeight(1);
  line(0, (t * 3) % 240, 240, (t * 3) % 240);
  line(0, (t * 7) % 240, 240, (t * 7) % 240);
  line(0, (t + 60) % 240, 240, (t + 60) % 240);
  line((t * 2) % 240, 0, (t * 2) % 240, 240);

  // Sparse pixel noise — short dashes at random positions each frame
  for (let n = 0; n < 3; n = n + 1) {
    let px = random(240);
    let py = random(240);
    line(px, py, px, py + 4);
  }

  // Corner brackets
  noFill();
  stroke(255);
  strokeWeight(1);
  let bl = 18;
  line(0, 0, bl, 0);             line(0, 0, 0, bl);
  line(240 - bl, 0, 240, 0);     line(240, 0, 240, bl);
  line(0, 240 - bl, 0, 240);     line(0, 240, bl, 240);
  line(240 - bl, 240, 240, 240); line(240, 240 - bl, 240, 240);
}
