# Q-Ring

A standalone p5.js-style sketch runner that lives in a 240×240 round LCD —
runs on a Waveshare RP2040-LCD-1.28.

## Build

```
pio run                    # compile
pio run -t upload          # flash firmware (BOOTSEL or picotool)
pio run -t buildfs         # build the FatFS image from data/
pio run -t uploadfs        # flash the filesystem (default sketches + docs)
```

The device enumerates as a composite USB device: a CDC Serial port (115200)
and a mass-storage drive labeled **Q-RING** with a `sketches/` folder.

## How sketches work

Either edit `sketches/current.js` on the drive and **eject** to reload, or
run the live-reload watcher:

```
cd tools/qring-watch
npm install
node index.js ~/my-sketches/
```

Any `.js` saved in the folder pushes to the device over Serial within
~500 ms — no eject needed.

See `data/sketches/SUPPORTED.md` for the supported p5 surface and dialect
notes.

## Serial commands

```
sketch on | off | reload | info
eject                   # programmatic remount trigger
clean                   # remove macOS dotfile spam
rotate 0|1|2|3|auto
alert <message>
bright <0-255>
<face state name>       # force fallback face (happy, sad, ...)
```

## Vendored

mJS lives at `src/vendor/mjs/` — fetched once from
<https://github.com/cesanta/mjs>. If you wipe the tree, the file is one URL
each:

```powershell
$base = 'https://raw.githubusercontent.com/cesanta/mjs/master'
Invoke-WebRequest "$base/mjs.h" -OutFile src/vendor/mjs/mjs.h
Invoke-WebRequest "$base/mjs.c" -OutFile src/vendor/mjs/mjs.c
```
