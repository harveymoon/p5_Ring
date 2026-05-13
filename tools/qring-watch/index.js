#!/usr/bin/env node
// =============================================================================
// qring-watch — watches a local folder, pushes .js sketches to a Q-Ring over
// USB Serial. Instant reload, no eject needed.
//
// Usage:
//   node index.js <folder>                    # auto-detect serial port
//   node index.js <folder> --port /dev/cu...  # explicit port
//
// The folder's `current.js` is the one Q-Ring runs. Any other .js file is
// also uploaded so you can build up an examples/ subdirectory.
// =============================================================================
'use strict';

const fs = require('fs');
const path = require('path');
const { SerialPort } = require('serialport');
const chokidar = require('chokidar');

const argv = process.argv.slice(2);
if (argv.length < 1) {
    console.error('Usage: node index.js <folder> [--port /dev/cu.usbmodemXXXX]');
    process.exit(1);
}
const watchDir = path.resolve(argv[0]);
let portPath = null;
const portIdx = argv.indexOf('--port');
if (portIdx >= 0 && argv[portIdx + 1]) portPath = argv[portIdx + 1];

if (!fs.existsSync(watchDir)) {
    console.error(`folder not found: ${watchDir}`);
    process.exit(1);
}

async function findPort() {
    if (portPath) return portPath;
    const list = await SerialPort.list();
    // Q-Ring USB product is "Q-Ring"; manufacturer is "Processing Foundation Friends"
    const match = list.find(p =>
        (p.productId && /Q-?Ring/i.test(p.productName || '')) ||
        /Q-Ring/i.test(p.manufacturer || '') ||
        /usbmodem/i.test(p.path || '') ||
        /COM\d+/.test(p.path || '')
    );
    if (!match) {
        console.error('No Q-Ring device found. Pass --port explicitly.');
        console.error('Available ports:');
        for (const p of list) console.error(`  ${p.path}  ${p.manufacturer || ''}  ${p.productName || ''}`);
        process.exit(1);
    }
    return match.path;
}

async function main() {
    const found = await findPort();
    console.log(`[qring-watch] using port: ${found}`);
    console.log(`[qring-watch] watching:   ${watchDir}`);

    const port = new SerialPort({ path: found, baudRate: 115200 });
    port.on('error', err => console.error('serial error:', err.message));
    port.on('data', d => process.stdout.write(d.toString()));

    let queue = Promise.resolve();
    function upload(file) {
        queue = queue.then(async () => {
            const rel = path.relative(watchDir, file).replace(/\\/g, '/');
            const devicePath = (rel === 'current.js') ? '/sketches/current.js' : `/sketches/${rel}`;
            const body = fs.readFileSync(file);
            const header = `UPLOAD ${devicePath} ${body.length}\n`;
            console.log(`[qring-watch] uploading ${rel} (${body.length} bytes) -> ${devicePath}`);
            await new Promise((res, rej) => port.write(header, e => e ? rej(e) : res()));
            await new Promise((res, rej) => port.write(body,   e => e ? rej(e) : res()));
            await new Promise((res, rej) => port.write('\nEND\n', e => e ? rej(e) : res()));
            await new Promise(r => setTimeout(r, 100));
        }).catch(e => console.error('upload failed:', e.message));
    }

    const w = chokidar.watch(watchDir, {
        persistent: true,
        ignoreInitial: false,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: { stabilityThreshold: 250, pollInterval: 50 }
    });
    w.on('add',    f => /\.js$/.test(f) && upload(f));
    w.on('change', f => /\.js$/.test(f) && upload(f));

    console.log('[qring-watch] ready. Save a .js file to push.');
}

main().catch(e => { console.error(e); process.exit(1); });
