let startAngle = 0;

function setup() {
//  createCanvas(240, 240);
     background(0);
  noStroke();
     autoRotate();
}

function draw() {
  

  startAngle += 0.02;

  let angle = startAngle;

  for (let x = 0; x <= width; x += 20) {

    let s = sin(angle);
    let c = cos(angle);
    let n = noise(angle);

    let y1 = map(s, -1, 1, 0, height);
    let y2 = map(c, -1, 1, 0, height);
    let y3 = map(n, 0, 1, 0, height);

    // RGB oscillation instead of HSB
    let r = 128 + 127 * sin(angle + x * 0.02);
    let g = 128 + 127 * sin(angle + 2 + x * 0.02);
    let b = 128 + 127 * sin(angle + 4 + x * 0.02);
      

    fill(r, g, b, 180);
    ellipse(x, y1, 18);

    fill(r * 0.9, g * 0.9, b * 0.9, 80);
    ellipse(x, y2, 18);

    fill(r * 0.8, g * 0.8, b * 0.8, 180);
    ellipse(x, y3, 18);

    angle += 1;
  }
}