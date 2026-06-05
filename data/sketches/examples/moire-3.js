let theta = 0;

let wM = 5;
let hM = 10;
let speed = 0.2;

function setup() {
//  createCanvas(240, 240);
    autoRotate();
}

function draw() {
  background(255);
  noFill();
  stroke(0);
    strokeWeight(3);

  translate(width / 2, height / 2);

  // base radial ellipse field
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
    ellipse(0, y, 2*i * wM, 2*i * wM);
  }

  pop();

  theta += speed;
}