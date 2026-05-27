// clock.js — analog clock showing time since boot
//
// Demonstrates nested rotate/push/pop transforms. The hour, minute, and
// second hands all start at the same origin and rotate by different
// amounts each frame. Push/pop isolate each hand's rotation so they
// don't compound.
//
// Note: this is uptime, not wall-clock time — millis() is "ms since the
// device booted", which resets to 0 on power-up. So at first plug-in the
// clock starts at 12.

function setup() {
  // A clock face is one of those rare cases where you DO want the canvas
  // to rotate with the device — so "up" on the dial always faces up.
  autoRotate();
}

function draw() {
  background(10);
    fill(255);
textSize(34);
//  text('Become A Mother ', 20,100)
//    text('At The End', 20,125)
//    text('Of The World', 20,150)
    
    
    let lines = [
    "It's",
     "gonna be",
    "great"
  ];

  translate(50, 120);

  let stretch = map(sin(frameCount * 0.05), -1, 1, 0.7, 1.5);

  push();
  scale(stretch, 1); // stretch horizontally
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], sin(frameCount * 0.1 + i * 0.4) * 20, (i - 1) * 50);
//      text(lines[i], 0, (i - 1) * 50);
  }
  pop();
//    let msg = "It is going to be great";
//  let radius = 80;
//
//  translate(width / 2, height / 2);
//
//  for (let i = 0; i < msg.length; i++) {
//    let angle = map(i, 0, msg.length, 0, TWO_PI) + frameCount * 0.01;
//
//    push();
//    rotate(angle);
//    translate(radius, 0);
//    rotate(HALF_PI); // makes letters face outward
//    text(msg[i], 0, 0);
//    pop();
//  }
    
    
}
