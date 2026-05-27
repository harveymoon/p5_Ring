// shapes.js — pure-drawing demo
//
// Shows off all the primitives + nested transforms (push/pop, rotate).
// No sensor input, no autoRotate — the artwork stays put no matter how
// you hold the device. A good template if you want to design a fixed
// composition that doesn't react to tilt.

  
let gx = 10;
let gy = 10;

let count = 0;
    

function setup() {
//  background(0);
//frameRate(10);
    //autoRotate();
    
}

function draw() {
  background(0);
// circle(120,120,50);
//    for (let xn = 0； xn< gx; xn++){
//        ellipse(xn,20,20,20);
//    }
 stroke(255);
    strokeWeight(3);
    
    count = count + 0.01;
    
    let spacing = 30;
    
    for (let i = 0; i < 8; i++) {
      
        
         for (let j = 0; j < 8; j++) {
//             circle(i*20, j*20,20,20);
             push();
             translate(i*spacing, j*spacing)
//             let angN = atan2(accelX, accelY);
             let angN = noise(i*0.1+count*0.1,j+count);
             rotate(degrees(angN));
             line(0,0, 0,10);
             pop();
         }
        
  }

    

}