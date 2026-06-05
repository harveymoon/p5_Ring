let theta = 0;

let wM = 5;
let hM = 10;
let speed = 0.2;

function setup() {
//  createCanvas(240, 240);
}

function draw() {
  background(255);
  noFill();
  stroke(0);

  // smoothly animate stroke weight: 1 → 3 → 1
  let sw = map(sin(frameCount * 0.1), -1, 1, 1, 4);
  strokeWeight(sw);

  translate(width / 2, height / 2);

  // base ellipse field
  for (let i = 0; i < 60; i++) {
    ellipse(0, 0, i * wM, i * hM);
  }

  // rotating layer
  push();
  rotate(theta);

  for (let i = 0; i < 30; i++) {
    let x = i * 6;
    let y = i * 4;

    ellipse(x, 0, i * hM, i * hM);
    ellipse(0, y, 2 * i * wM,  i * wM);
  }

  pop();

  theta += speed;
}