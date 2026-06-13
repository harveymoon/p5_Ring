# p5-ring Sketch Reference

A small p5-flavored playground that lives on a 240×240 round LCD.

---

## What works (just like p5)

### Drawing
`background`, `fill`, `stroke`, `noFill`, `noStroke`, `strokeWeight`
`line`, `rect` (incl. corner radius), `ellipse`, `circle`, `triangle`, `point`, `arc`
`text`, `textSize`, `textAlign(LEFT | CENTER | RIGHT)`

### Math
`random`, `noise` (Perlin), `map`, `lerp`, `dist`, `constrain`, `radians`, `degrees`
Plus everything on `Math.*` (sin, cos, atan2, sqrt, abs, floor, ceil, round, ...)
Constants: `PI`, `TWO_PI`, `HALF_PI`

### Transforms
`translate`, `rotate`, `scale`, `push`, `pop` (stack depth 8)
Helper: `centerOrigin()` translates to (width/2, height/2)

### Globals
`width`, `height` — both 240
`frameCount`, `millis()`
`accelX`, `accelY`, `accelZ` — bonus from the onboard IMU. Tilt the device!

---

## JavaScript dialect — small differences

The on-device engine is **mJS**. Everything is synchronous. Compared to p5 web:

- Use `let` (not `var`). p5-ring auto-rewrites `var ` → `let ` on load, but
  declarations like `const` are not supported.
- No arrow functions: write `function (x) { return x*2 }` not `x => x*2`.
- No classes — use object literals + functions.
- No template literals — concatenate strings with `+`.
- No regular expressions, no `Promise`, no `async`/`await`.
- **Numbers in `+` need an explicit `str()` cast.** mJS forbids
  `"frame " + frameCount`. Write `"frame " + str(frameCount)` instead.
  `str()` is provided as a global.

---

## Things that *look* different

- **Alpha is approximated** by blending against the most-recent `background()`
  color at fill time. Layering many translucent shapes will not stack the way
  it does on the web.
- **strokeWeight** is clamped to 8.
- **The display is round.** Corners are invisible. Stay within ~110 px of center.
- **`mouseX`/`mouseY` don't exist** — there's no touch. `accelX`/`accelY`/`accelZ`
  is the input.
- **Auto-rotate is off by default.** Sketches stay upright on screen
  regardless of how the device is held. Call `autoRotate()` in `setup()`
  if you want gravity-aware canvas tilt (so "up" always points up).
  `noAutoRotate()` flips it back off.
- Sketches that want sensor input but a stationary canvas can read
  `accelX` / `accelY` / `accelZ` directly without `autoRotate()`.

---

## Tips for smooth performance

- Aim for under ~300 shapes per frame.
- Pre-allocate arrays in `setup()`, not in `draw()`.
- The watchdog flags a sketch if `draw()` exceeds 700 ms for 3 frames in a row.
  When that happens you'll see a brief red error overlay, then the device drops
  back to its built-in happy face. Errors are logged to
  `/sketches/.errors/last.log`; the last crash also prints to the serial log,
  visible in the companion's log pane.

---

## Hello world

```js
function setup() {
  // nothing to do — the canvas is already 240x240
}

function draw() {
  background(0);
  fill(0, 200, 255);
  circle(width / 2, height / 2 + sin(frameCount * 0.05) * 30, 80);
}
```

Push this with the companion app (or drop it in a watched folder for the dev
CLI) and the device reloads it over USB within ~500 ms.
