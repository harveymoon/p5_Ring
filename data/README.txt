p5-ring — a tiny p5.js sketch runner you can hold in your hand.

EDITING (companion app — nothing to install):
  1. Open  https://harveymoon.github.io/p5_Ring/  in Chrome or Edge.
  2. Click "Connect p5-ring" and pick the device (one-time USB permission).
  3. Choose an example from the dropdown, or open a .js file from your
     computer. Each time you save the file it pushes over USB and the device
     reloads within ~500 ms. There is no drive to mount or eject.

DEV MODE (terminal watcher, optional):
  Plug p5-ring into a USB port, then:
     cd tools/p5ring-watch && npm install && node index.js ~/my-sketches/
  Edit any file in ~/my-sketches/, save, and p5-ring updates within ~500 ms.

EXAMPLES live in   sketches/examples/   — they're also baked into the
companion's dropdown. Over serial, `sketch use <name>` copies one over
current.js and reloads.

REFERENCE & gotchas:   sketches/SUPPORTED.md

If a sketch crashes, the device shows a red error flash, persists the error to
sketches/.errors/last.log, then drops back to its built-in happy face. It
won't get bricked.

Made with love for someone who teaches the world to code.
