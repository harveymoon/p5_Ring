// shapes.js — pure-drawing demo
//
// Shows off all the primitives + nested transforms (push/pop, rotate).
// No sensor input, no autoRotate — the artwork stays put no matter how
// you hold the device. A good template if you want to design a fixed
// composition that doesn't react to tilt.



function setup() {
    //  background(0);
    //frameRate(10);
        autoRotate();


}

function draw() {
    background(0);
    stroke(255);
    noFill();
    strokeWeight(1);

    let spacing = 14;
    let offset = sin(frameCount * 0.09) * 138;

    let cx = 120;
    let cy = 120;


    // 3 directions, 120° apart
    for (let i = 0; i < 3; i++) {
        //        stroke(...colors[i]);
        if (i === 0) {
            stroke(255, 255, 0);
        } else if (i === 1) {
            stroke(255, 0, 255);
        } else {
            stroke(0, 255, 255);
        }
        
        let angle = radians(-90 + i * 120);

        let x = cx + cos(angle) * offset;
        let y = cy + sin(angle) * offset;

        for (let r = 10; r < 240; r += spacing) {
            circle(x, y, r);
        }
    }
}
