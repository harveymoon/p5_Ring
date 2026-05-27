// shapes.js — pure-drawing demo
//
// Shows off all the primitives + nested transforms (push/pop, rotate).
// No sensor input, no autoRotate — the artwork stays put no matter how
// you hold the device. A good template if you want to design a fixed
// composition that doesn't react to tilt.



function setup() {
    autoRotate();
    
    

}

function draw() {
  background(0);
  noFill();



  fill(255);
//  textFont('monospace');
  textSize(20);
//  textLeading(8);

//  let art = `
//        _      
//      _(_)_
// @@@@ (_)@(_)  wWWWw
//@@()@@  (_)\\   (___)
// @@@@    \\|     Y
//  /      \\|    \\|/
//\\ |    \\  |  / |
//\\\\|// \\\\|//\\\\|//
//^^^^^^^^^^^^^^^^^^
//`;

//  text(':D', 80, 140);
    

//  text(' 
//    @@@
//   @@@@@
//    @@@
//     |
//    /|\\
//     |', 
//       30, 60);
//    
     text(' 
     _      
      _(_)_
 @@@@ (_)@(_)  wWWWw
@@()@@  (_)\\   (___)
 @@@@    \\|     Y
  /      \\|    \\|/
\\ |    \\  |  / |
\\\\|/ / \\\\|//\\\\|//
^^^^^^^^^^^^^^^^^^', 
       10, 60);
    
//  text(' 
//    ._____A_____,
// |`          :\
// | `         : B
// |  `        :  \
// C   +-----A-----+
// |   :       :   :
// |__ : _A____:   :
// `   :        \  :
//  `  :         B :
//   ` :          \:
//    `:_____A_____>
//
//', 
//       10, 60);
//    
    
    
}
