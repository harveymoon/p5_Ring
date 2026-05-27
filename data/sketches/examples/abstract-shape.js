// shapes.js — pure-drawing demo
//
// Shows off all the primitives + nested transforms (push/pop, rotate).
// No sensor input, no autoRotate — the artwork stays put no matter how
// you hold the device. A good template if you want to design a fixed
// composition that doesn't react to tilt.



function setup() {
    //  background(0);
    //frameRate(10);
    //    autoRotate();
//    rectMode(CENTER)

}

function draw() {
    background(0);


    let spacing = 20;
    noFill();
    stroke(255);
    strokeWeight(2);
    
    
//    for (let x = 0; x < 250; x = x + spacing) {
//        circle(120, 120, 240 - x)
//
//    }
    let pulse = map(sin(frameCount * 0.05), -1, 1, 1, 2.2);
    for (let x = 0; x < 250; x += spacing) {
    rect(-20, -20, (240 - x) * pulse,(240 - x) * pulse);
  }

}
