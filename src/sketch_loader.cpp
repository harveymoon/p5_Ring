#include "sketch_loader.h"
#include "default_sketches.h"
#include "config.h"
#include <Arduino.h>
#include <LittleFS.h>
#include <string.h>

// =============================================================================
// Q-Ring sketch loader (LittleFS).
//
// Storage: LittleFS on the 1 MB filesystem partition. Host writes happen over
// USB Serial via the UPLOAD <path> <len>\n<bytes>\nEND\n protocol parsed in
// main.cpp; this module exposes the FS read/write/append helpers and a single
// reload callback fired after any UPLOAD that touches SKETCH_PATH or after the
// `sketch reload` Serial command.
//
// The mass-storage drive path (FatFSUSB) was tried earlier but its FTL state
// from prior flash cycles caused FatFS.begin() to hang. LittleFS is what
// PlatformIO builds natively, mounts reliably, and is the format the
// arduino-pico examples expect. Trade-off: no Finder-mountable drive. Mitigated
// by the browser companion UI that polls a host folder and streams uploads.
// =============================================================================

static volatile bool      _force_reload = false;
static uint32_t           _last_crc      = 0;
static sketch_reload_cb_t _cb            = nullptr;
static bool               _initialized   = false;
static char               _scratch[SKETCH_SRC_MAX];

static uint32_t _crc32(const uint8_t* data, size_t n, uint32_t crc = 0) {
    crc = ~crc;
    for (size_t i = 0; i < n; i++) {
        crc ^= data[i];
        for (int k = 0; k < 8; k++)
            crc = (crc >> 1) ^ (0xEDB88320u & (-(int32_t)(crc & 1)));
    }
    return ~crc;
}

// =============================================================================
// Default content baked into firmware. Self-healing on first boot or wipe.
// =============================================================================
static const char DEFAULT_CURRENT_JS[] =
"// Q-Ring starter sketch. Tilt the device — the ball follows gravity.\n"
"// Save your edits in the companion app to push them over USB Serial.\n"
"function setup() {}\n"
"function draw() {\n"
"  background(8, 12, 30);\n"
"  let cx = width / 2 + accelX * 60;\n"
"  let cy = height / 2 + accelY * 60;\n"
"  noFill(); stroke(60, 200, 255, 120); strokeWeight(2);\n"
"  for (let i = 0; i < 6; i++) {\n"
"    let r = 60 + i * 8 + sin(frameCount * 0.05 + i) * 4;\n"
"    circle(width / 2, height / 2, r * 2);\n"
"  }\n"
"  noStroke(); fill(255, 180, 80); circle(cx, cy, 40);\n"
"  fill(255, 230, 180); circle(cx - 6, cy - 6, 12);\n"
"}\n";

static void _seed_defaults(void) {
    if (!LittleFS.exists("/sketches")) LittleFS.mkdir("/sketches");
    if (!LittleFS.exists("/sketches/examples")) LittleFS.mkdir("/sketches/examples");
    if (!LittleFS.exists(SKETCH_ERROR_DIR)) LittleFS.mkdir(SKETCH_ERROR_DIR);

    if (!LittleFS.exists(SKETCH_PATH)) {
        File f = LittleFS.open(SKETCH_PATH, "w");
        if (f) { f.write((const uint8_t*)DEFAULT_CURRENT_JS, strlen(DEFAULT_CURRENT_JS)); f.close(); }
        Serial.println("[LOADER] seeded default current.js");
    }

    int new_examples = 0;
    for (const DefaultExample* e = DEFAULT_EXAMPLES; e->path; e++) {
        if (!LittleFS.exists(e->path)) {
            File f = LittleFS.open(e->path, "w");
            if (f) { f.write((const uint8_t*)e->src, strlen(e->src)); f.close(); new_examples++; }
        }
    }
    if (new_examples) Serial.printf("[LOADER] seeded %d example(s)\n", new_examples);

    // Prune any /sketches/examples/*.js files that aren't in the current
    // DEFAULT_EXAMPLES set. Keeps the on-device list in sync with what ships
    // when example names change (e.g. shake.js → birthday.js).
    // Collect stale paths first (mutating LittleFS during Dir iteration
    // invalidates the iterator).
    String stale[16];
    int n_stale = 0;
    {
        Dir d = LittleFS.openDir("/sketches/examples");
        while (d.next() && n_stale < 16) {
            char full[80];
            snprintf(full, sizeof(full), "/sketches/examples/%s", d.fileName().c_str());
            bool known = false;
            for (const DefaultExample* e = DEFAULT_EXAMPLES; e->path; e++) {
                if (strcmp(e->path, full) == 0) { known = true; break; }
            }
            if (!known) stale[n_stale++] = String(full);
        }
    }
    int pruned = 0;
    for (int i = 0; i < n_stale; i++) {
        if (LittleFS.remove(stale[i])) {
            Serial.printf("[LOADER] pruned %s\n", stale[i].c_str());
            pruned++;
        }
    }
    if (pruned) Serial.printf("[LOADER] pruned %d stale example(s) total\n", pruned);
}

// =============================================================================
int sketch_loader_init(void) {
    Serial.println("[LOADER] LittleFS.begin()"); Serial.flush();
    uint32_t t0 = millis();
    bool ok = LittleFS.begin();
    Serial.printf("[LOADER]   -> %s (%lu ms)\n", ok ? "ok" : "failed",
                  (unsigned long)(millis() - t0)); Serial.flush();

    if (!ok) {
        Serial.println("[LOADER] format + retry"); Serial.flush();
        LittleFS.format();
        if (!LittleFS.begin()) return -1;
    }

    _seed_defaults();
    _initialized = true;

    int n = sketch_loader_read(SKETCH_PATH, _scratch, sizeof(_scratch));
    if (n > 0) _last_crc = _crc32((const uint8_t*)_scratch, (size_t)n);

    Serial.println("[LOADER] ready");
    return 0;
}

bool sketch_loader_host_connected(void) { return false; }  // no MSC in this build

int sketch_loader_read(const char* path, char* buf, size_t max) {
    if (!_initialized) return -1;
    File f = LittleFS.open(path, "r");
    if (!f) return -1;
    size_t n = f.read((uint8_t*)buf, max - 1);
    buf[n] = '\0';
    f.close();
    return (int)n;
}

int sketch_loader_size(const char* path) {
    if (!_initialized) return -1;
    File f = LittleFS.open(path, "r");
    if (!f) return -1;
    int sz = (int)f.size();
    f.close();
    return sz;
}

int sketch_loader_write(const char* path, const char* buf, size_t len) {
    if (!_initialized) return -1;
    const char* slash = strrchr(path, '/');
    if (slash && slash != path) {
        char dir[64];
        size_t dl = (size_t)(slash - path);
        if (dl >= sizeof(dir)) return -1;
        memcpy(dir, path, dl); dir[dl] = '\0';
        if (!LittleFS.exists(dir)) LittleFS.mkdir(dir);
    }
    File f = LittleFS.open(path, "w");
    if (!f) return -1;
    size_t n = f.write((const uint8_t*)buf, len);
    f.close();
    return (int)n;
}

int sketch_loader_append_error(const char* path, const char* err) {
    if (!_initialized) return -1;
    File f = LittleFS.open(path, "a");
    if (!f) f = LittleFS.open(path, "w");
    if (!f) return -1;
    size_t n = f.write((const uint8_t*)err, strlen(err));
    f.write((const uint8_t*)"\n", 1);
    f.close();
    return (int)n;
}

void sketch_loader_on_reload(sketch_reload_cb_t cb) { _cb = cb; }
void sketch_loader_force_reload(void)               { _force_reload = true; }
uint32_t sketch_loader_current_crc(void)            { return _last_crc; }

int sketch_loader_clean_dotfiles(void) { return 0; }

int sketch_loader_copy_to_current(const char* src_path) {
    if (!_initialized) return -1;
    int n = sketch_loader_read(src_path, _scratch, sizeof(_scratch));
    if (n <= 0) return -1;
    int rc = sketch_loader_write(SKETCH_PATH, _scratch, (size_t)n);
    if (rc < 0) return -1;
    _force_reload = true;
    return n;
}

int sketch_loader_list(const char* path, sketch_list_cb_t cb, void* user) {
    if (!_initialized) return -1;
    Dir d = LittleFS.openDir(path);
    int count = 0;
    while (d.next()) {
        cb(d.fileName().c_str(), d.fileSize(), user);
        count++;
    }
    return count;
}

void sketch_loader_tick(void) {
    if (!_initialized) return;
    if (_force_reload) {
        _force_reload = false;
        int n = sketch_loader_read(SKETCH_PATH, _scratch, sizeof(_scratch));
        if (n > 0) _last_crc = _crc32((const uint8_t*)_scratch, (size_t)n);
        if (_cb) _cb(SKETCH_PATH);
    }
}
