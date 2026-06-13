# Code Audit — p5-ring
Automated review 2026-06-10. Items for the dev to address when time permits.

No hardcoded credentials or API keys were found (device is a non-WiFi RP2040; the companion talks WebSerial only).

---

## Status — all 9 resolved 2026-06-12

| # | Sev | Item | Fix |
|---|-----|------|-----|
| 1 | High | Boot prune deletes uploaded examples | Prune now an explicit legacy-name list (`shake.js`), never "everything unrecognized" |
| 2 | High | Infinite-loop sketch wedges device | RP2040 hardware watchdog (8 s) in `loop()`; a watchdog reboot parks `current.js` for that boot |
| 3 | Med | Rejected UPLOAD parses body as commands | Device enters upload mode + discards body on reject (`[UPLOAD] REJECTED …`); 2 s inactivity abort; companion guards >8192 B |
| 4 | Med | `CLOCK_OFFSET_S` injection never happened | `injectClockOffset()` in companion `uploadToDevice()` substitutes seconds-since-midnight |
| 5 | Med | `ascii.js` multi-line string = parse error | Rewritten with `\n` separators + correct header; `node --check` passes |
| 6 | Low | 8192-byte sketch truncated on read | `_scratch` / `_src_buf` sized `SKETCH_SRC_MAX + 1` |
| 7 | Low | DL recorder truncates / replay overruns | Whole-command reservation (`_dl_fit`) + sticky overflow flag; `dl_play()` bounds every operand read |
| 8 | Low | `-DTARGET_FPS=60` silently overridden | `config.h` wrapped in `#ifndef`; dead build flag commented out (runtime stays 30) |
| 9 | Low | `SUPPORTED.md` drift (200 ms, MSC drive) | Watchdog 700 ms; drive/eject refs replaced with companion/serial (also fixed `README.txt`, `current.js`) |

---

## 1. [High] Boot-time pruning deletes every uploaded/flashed example sketch

**File:** `src/sketch_loader.cpp` lines 80–106 (`_seed_defaults`, called from `sketch_loader_init` on **every** boot)

`_seed_defaults()` removes any file in `/sketches/examples/` whose path is not in `DEFAULT_EXAMPLES` — and `src/default_sketches.cpp:351-357` only bakes 7 examples (shapes, tilt, sensors, rain, wave, clock, birthday). Meanwhile the recent workflow actively populates that directory with more:

- `tools/p5ring-watch/_upload_diamond.js`, `_upload_flock_v4.js`, `_upload_once.js` push `diamond.js`, `flock.js`, `warp.js` to `/sketches/examples/`
- `tools/p5ring-watch/index.js` uploads any non-`current.js` file under `/sketches/<rel>` ("so you can build up an examples/ subdirectory")
- `pio run -t uploadfs` flashes all ~35 sketches from `data/sketches/examples/` into LittleFS

All of these are silently deleted on the next power cycle, after which `sketch use warp.js` etc. fails. This is user-data loss masquerading as cleanup.

**Fix:** Only prune when seeding for the first time (e.g. gate on a marker file), or prune from an explicit stale-name list instead of "everything I don't recognize". At minimum restrict the prune to renamed legacy names (e.g. `shake.js`).

---

## 2. [High] A sketch with an infinite loop permanently wedges the device — the "can't get bricked" guarantee doesn't hold

**File:** `src/sketch_vm.cpp` line 178 (`mjs_call` for `draw()`), `src/main.cpp` `loop()` (line 297)

The 700 ms watchdog (`SKETCH_WATCHDOG_MS`) only measures elapsed time **after** `mjs_call()` returns. mJS has no instruction/step limit and no hardware watchdog is enabled anywhere in `src/`. A sketch containing `while (true) {}` in `draw()` (or `setup()`) blocks `loop()` forever, so `_serial_tick()` never runs again — the UPLOAD protocol and all serial commands are dead. Worse, the bad sketch is `current.js`, so every reboot re-enters the hang; the only recovery is BOOTSEL + re-flashing the filesystem. `README.md:58-59` claims "It can't get bricked from a bad sketch. ✅" — currently false for non-terminating sketches.

**Fix:** Enable the RP2040 hardware watchdog (`rp2040.wdt_begin()` / feed it in `loop()`), and add a crash-marker scheme: write a "loading" flag before executing `current.js`, clear it after the first successful frame, and skip the sketch (fall back to face) if the flag survives a reboot. Optionally also use mJS's exec hooks to bail out of long-running scripts.

---

## 3. [Medium] Rejected UPLOAD header makes the device interpret the entire sketch body as serial commands

**Files:** `src/main.cpp` lines 170–186 (`_try_upload_header`) and 188–229 (`_serial_tick`); `docs/index.html` line 1179 (`uploadToDevice`)

If the header fails validation — `len > SKETCH_SRC_MAX` (8192), `len == 0`, or path ≥ 64 chars — `_try_upload_header()` returns `false`, the line falls through to `_handle_command()` ("unknown command"), and the device never enters upload mode. The host (companion or p5ring-watch) then streams the full body anyway, which the device parses **line by line as commands**. Any sketch line that happens to match a command (`bright …`, `color …`, `happy`, `sketch use …` in a comment) executes; everything else floods the log. The companion does no size check against the 8 KB limit, so any sketch > 8192 bytes triggers this confusing failure mode (existing examples already reach 7.3 KB).

Related: once an upload *does* start, there is no timeout — if the host dies mid-body, `_uploading` stays true forever and the command channel is wedged until reboot.

**Fix:** On header rejection, print an explicit `[UPLOAD] REJECTED …` and consume/discard `len` bytes anyway. In `docs/index.html` `uploadToDevice()`, refuse bodies > 8192 bytes with a clear error. Add an inactivity timeout (e.g. 2 s) that aborts `_uploading`.

---

## 4. [Medium] clock.js wall-time offset injection is documented but implemented nowhere

**Files:** `data/sketches/examples/clock.js` lines 1–7, 19; `docs/index.html` (`pushLoaded`/`uploadToDevice`, lines 853–857, 1179)

`clock.js` says "CLOCK_OFFSET_S is injected at upload time (seconds since midnight, local time)" and computes `secs = millis()/1000 + CLOCK_OFFSET_S`. No uploader in the repo (companion `index.html`, `tools/p5ring-watch/index.js`, or the `_switch_to.js`/`_upload_*.js` scripts) performs this substitution, and the firmware doesn't either. The "analog clock showing local wall time" always starts at 12:00:00 at boot.

**Fix:** In the companion's upload path, replace `let CLOCK_OFFSET_S = 0;` with the computed seconds-since-midnight before pushing (simple regex substitution), or change the header comment/title back to "time since boot".

---

## 5. [Medium] ascii.js contains a multi-line string literal — guaranteed parse error on device

**File:** `data/sketches/examples/ascii.js` lines 52–62

The active (non-commented) `text(' … ')` call spans 10 physical lines with raw newlines inside a single-quoted string. That's invalid in standard JavaScript and in mJS (and `SUPPORTED.md` explicitly rules out template literals, the only JS construct that allows this). Loading this sketch produces a parse error, the red overlay, and fallback to the face — the example can never run.

**Fix:** Build the ASCII art as concatenated lines with `\n` (`'line1\n' + 'line2\n' + …`) or draw each row with a separate `text()` call (which also matches the firmware's per-line alignment handling in `p5_text`).

---

## 6. [Low] Off-by-one: an exactly-8192-byte sketch uploads fine but is truncated on read

**Files:** `src/main.cpp` line 180 (accepts `n <= SKETCH_SRC_MAX` = 8192) vs `src/sketch_loader.cpp` line 139 (`f.read(buf, max - 1)` with `max = 8192` → reads at most 8191 bytes)

An upload of exactly 8192 bytes is accepted and written intact, but `sketch_loader_read()` (used by `sketch_vm_load` and `sketch_loader_copy_to_current`) silently drops the final byte, which can turn a valid sketch into a parse error (e.g. missing `}`).

**Fix:** Reject `n >= SKETCH_SRC_MAX` in `_try_upload_header`, or size `_src_buf`/`_scratch` at `SKETCH_SRC_MAX + 1`.

---

## 7. [Low] Display-list recorder can emit truncated commands; dl_play() can read past the buffer

**File:** `src/p5_bindings.cpp` lines 89–98 (`_dl_u8`/`_dl_u16`) and 452–499 (`dl_play`)

When the 4 KB DL buffer fills mid-command, the opcode byte can be written while its operand bytes are silently dropped (each `_dl_*` checks space independently). On replay, `dl_play()` then decodes garbage, and the `DLC_TRI` case reads 12 operand bytes without checking `i` against `_dl_len` — with `_dl_len` near 4095 this reads up to ~11 bytes past the end of `_dl_buf`. The new `orb.js`/`ryoji.js` sketches exercise this path (currently well under 4 KB, so it's latent, but any heavier DL sketch will hit it).

**Fix:** In each recording helper, check space for the *whole* command before writing any byte (or set a sticky overflow flag that truncates `_dl_len` back to the last complete command), and bound operand reads in `dl_play()` (`if (i + needed > _dl_len) break;`).

---

## 8. [Low] `-DTARGET_FPS=60` in platformio.ini is silently overridden back to 30

**Files:** `platformio.ini` line 26; `src/config.h` line 30

`config.h` does `#define TARGET_FPS 30` unconditionally, so the command-line `-DTARGET_FPS=60` just produces a macro-redefinition warning and every translation unit that includes `config.h` runs with `FRAME_BUDGET_MS = 33` (30 FPS). The build flag does nothing.

**Fix:** Wrap the config.h definition in `#ifndef TARGET_FPS … #endif`, or delete the build flag if 30 FPS is the intent.

---

## 9. [Low] SUPPORTED.md drift misleads sketch authors

**File:** `data/sketches/SUPPORTED.md` lines 68–71, 89

- States the watchdog flags `draw()` at **200 ms**; firmware uses **700 ms** (`config.h:36`).
- Says to read crash logs by "pop the drive in" and to deploy by "Save this as `sketches/current.js` and eject the drive" — the MSC drive was removed (serial-only now, per README and `sketch_loader.cpp` comments).

**Fix:** Update the numbers and replace drive-based instructions with the companion/serial workflow.
