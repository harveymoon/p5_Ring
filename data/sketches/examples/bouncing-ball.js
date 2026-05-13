let x = 120, y = 120, vx = 2.3, vy = 1.7;

function setup() {}

function draw() {
  background(20);
  x = x + vx;
  y = y + vy;
  if (x < 20 || x > 220) vx = -vx;
  if (y < 20 || y > 220) vy = -vy;
  fill(255, 200, 0);
  noStroke();
  circle(x, y, 36);
}
