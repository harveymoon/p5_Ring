p5-ring — a tiny p5.js sketch runner you can hold in your hand.

EDITING:
  1. Open  sketches/current.js  in any editor.
  2. Save.
  3. Drag the P5-RING drive icon to the trash (or hit Cmd+E) to eject.
     macOS only flushes writes on eject; the device reloads as soon as that
     finishes — within a second you'll see your changes on screen.

DEV MODE (instant reload, no eject):
  Plug p5-ring into a USB port, then on your Mac:
     cd tools/p5ring-watch && npm install && node index.js ~/my-sketches/
  Edit any file in ~/my-sketches/, save, and p5-ring updates within ~500 ms.

EXAMPLES live in   sketches/examples/   — copy one over current.js to try it.

REFERENCE & gotchas:   sketches/SUPPORTED.md

If a sketch crashes, the device shows a red error flash, persists the error to
sketches/.errors/last.log, then drops back to its built-in happy face. It
won't get bricked.

Made with love for someone who teaches the world to code.
