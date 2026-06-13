// ascii.js — ASCII-art tree drawn from one multi-line string.
//
// The firmware's text() splits on '\n' and aligns each line independently,
// so a string with embedded \n renders as a block of art. NOTE: raw newlines
// inside a quoted string are a parse error in mJS — every line break here is
// an explicit \n, and each literal backslash in the art is escaped as \\.

function setup() {}

function draw() {
  background(8, 14, 20);

  fill(120, 220, 140);
  textSize(8);
  textAlign(CENTER);

  let art =
    '     _\n' +
    '      _(_)_\n' +
    ' @@@@ (_)@(_)  wWWWw\n' +
    '@@()@@  (_)\\   (___)\n' +
    ' @@@@    \\|     Y\n' +
    '  /      \\|    \\|/\n' +
    '\\ |    \\  |  / |\n' +
    '\\\\|// \\\\|//\\\\|//\n' +
    '^^^^^^^^^^^^^^^^^^';

  text(art, 120, 96);
}
