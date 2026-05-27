#include "sketch_vm.h"
#include "sketch_loader.h"
#include "p5_bindings.h"
#include "p5_math.h"
#include "face.h"
#include "config.h"
#include <Arduino.h>
#include <LovyanGFX.hpp>
#include <string.h>
#include <stdio.h>

extern "C" {
#include "vendor/mjs/mjs.h"
}

// =============================================================================
static struct mjs* _m            = nullptr;
static bool        _active       = false;
static bool        _has_error    = false;
static char        _err_text[256] = {0};
static uint32_t    _frame_count  = 0;
static uint32_t    _slow_frames  = 0;
static uint32_t    _last_dt_ms   = 0;
static uint32_t    _last_blit_ms = 0;
static uint32_t    _last_tick_ms = 0;

static char _src_buf[SKETCH_SRC_MAX];
// Combined buffer: prelude + user source. Prelude is ~3 KB, user source up to
// SKETCH_SRC_MAX (~8 KB), giving ~12 KB max input to mjs_exec.
static char _exec_buf[SKETCH_SRC_MAX + 4096];

// =============================================================================
// Substitute "var " with "let " in-place. Common copy-paste from p5 web; mJS
// is let-only. Cheap loop, runs once per sketch load.
// =============================================================================
static void _patch_var_to_let(char* buf) {
    char* p = buf;
    while ((p = strstr(p, "var ")) != nullptr) {
        bool at_start = (p == buf) || p[-1] == ' ' || p[-1] == '\n' ||
                        p[-1] == '\r' || p[-1] == '\t' || p[-1] == '{' || p[-1] == ';';
        if (at_start) { p[0] = 'l'; p[1] = 'e'; p[2] = 't'; }
        p += 4;
    }
}

static void _capture_error(const char* phase, mjs_err_t err) {
    const char* msg = mjs_strerror(_m, err);
    snprintf(_err_text, sizeof(_err_text), "[%s] %s", phase, msg ? msg : "(no message)");
    _has_error = true;
    Serial.printf("[VM] ERROR %s\n", _err_text);

    // Fallback face is about to take over — restore the device's default
    // auto-rotate so the standby behavior looks polished.
    face_set_rotation_auto(true);

    // Persist log
    char line[512];
    snprintf(line, sizeof(line), "frame=%lu ms=%lu  %s",
             (unsigned long)_frame_count, (unsigned long)millis(), _err_text);
    sketch_loader_append_error(SKETCH_ERROR_LAST, line);
}

// =============================================================================
int sketch_vm_init(void) {
    p5m_seed(micros() ^ 0xA5A5A5A5);
    _m = mjs_create();
    if (!_m) { Serial.println("[VM] mjs_create failed"); return -1; }
    p5_bindings_install(_m);
    Serial.println("[VM] mJS ready, p5 bindings installed");
    _active = false;
    return 0;
}

void sketch_vm_clear_error(void) {
    _has_error = false;
    _err_text[0] = '\0';
    _slow_frames = 0;
}

int sketch_vm_load(const char* path) {
    if (!_m) return -1;

    int n = sketch_loader_read(path, _src_buf, sizeof(_src_buf));
    if (n <= 0) {
        snprintf(_err_text, sizeof(_err_text), "[load] cannot read %s", path);
        _has_error = true;
        return -1;
    }
    _patch_var_to_let(_src_buf);

    // Wipe previous user functions by re-execing the prelude (cheap, ~1ms).
    // Actually: just re-create the instance to get a clean slate.
    mjs_destroy(_m);
    _m = mjs_create();
    if (!_m) return -1;
    p5_bindings_install(_m);

    sketch_vm_clear_error();

    // Each new sketch starts upright and stationary. Sketches that want the
    // IMU-driven canvas tilt opt in with autoRotate(). The fallback face
    // re-enables auto-rotate in _capture_error so the standby behavior is
    // preserved on crashes.
    face_set_rotation(0);

    // Build combined source: prelude (defines p5 names via FFI) + user code.
    // Both must live in the same execution to share scope in mJS.
    const char* prelude = p5_bindings_prelude_js();
    size_t pn = strlen(prelude);
    size_t un = strlen(_src_buf);
    if (pn + un + 4 > sizeof(_exec_buf)) {
        snprintf(_err_text, sizeof(_err_text),
                 "[load] sketch too large: %u + %u > %u",
                 (unsigned)pn, (unsigned)un, (unsigned)sizeof(_exec_buf));
        _has_error = true;
        return -2;
    }
    memcpy(_exec_buf, prelude, pn);
    _exec_buf[pn]     = '\n';
    memcpy(_exec_buf + pn + 1, _src_buf, un);
    _exec_buf[pn + 1 + un] = '\0';

    mjs_val_t res;
    mjs_err_t err = mjs_exec(_m, _exec_buf, &res);
    if (err != MJS_OK) { _capture_error("parse", err); _active = false; return -2; }

    // Call setup() if defined
    mjs_val_t setup_fn = mjs_get(_m, mjs_get_global(_m), "setup", ~0);
    if (mjs_is_function(setup_fn)) {
        err = mjs_call(_m, &res, setup_fn, mjs_mk_undefined(), 0);
        if (err != MJS_OK) { _capture_error("setup", err); _active = false; return -3; }
    }

    _active = true;
    _frame_count = 0;
    _last_tick_ms = millis();
    Serial.printf("[VM] sketch loaded (%d bytes)\n", n);
    return 0;
}

void sketch_vm_set_active(bool on) {
    _active = on;
    if (on) sketch_vm_clear_error();
}

bool sketch_vm_active(void)         { return _active && !_has_error; }
bool sketch_vm_has_error(void)      { return _has_error; }
const char* sketch_vm_error_text(void) { return _err_text; }

uint32_t sketch_vm_last_dt_ms(void)   { return _last_dt_ms; }
uint32_t sketch_vm_last_blit_ms(void) { return _last_blit_ms; }

uint32_t sketch_vm_heap_free(void) {
    extern int rp2040_free_heap();
    // Use the core's helper if available
    return (uint32_t)rp2040.getFreeHeap();
}

// =============================================================================
void sketch_vm_tick(void) {
    if (!_m || !_active || _has_error) return;

    uint32_t now = millis();
    float dt = (float)(now - _last_tick_ms) / 1000.0f;
    if (dt <= 0) dt = 0.001f;
    _last_tick_ms = now;

    _frame_count++;
    p5_bindings_update_globals(_m, _frame_count);
    p5_bindings_reset_state();

    mjs_val_t draw_fn = mjs_get(_m, mjs_get_global(_m), "draw", ~0);
    if (!mjs_is_function(draw_fn)) {
        // No draw() defined — keep canvas as setup left it; blit straight through
    } else {
        uint32_t t0 = millis();
        mjs_val_t res;
        mjs_err_t err = mjs_call(_m, &res, draw_fn, mjs_mk_undefined(), 0);
        uint32_t elapsed = millis() - t0;
        _last_dt_ms = elapsed;

        if (err != MJS_OK) {
            _capture_error("draw", err);
            _active = false;
            return;
        }
        if (elapsed > SKETCH_WATCHDOG_MS) {
            _slow_frames++;
            Serial.printf("[VM] slow draw (%lu ms)  count=%lu\n",
                          (unsigned long)elapsed, (unsigned long)_slow_frames);
            if (_slow_frames >= 3) {
                snprintf(_err_text, sizeof(_err_text),
                         "[watchdog] draw() exceeded %d ms for 3 frames", SKETCH_WATCHDOG_MS);
                _has_error = true;
                sketch_loader_append_error(SKETCH_ERROR_LAST, _err_text);
                _active = false;
                return;
            }
        } else if (_slow_frames > 0) {
            _slow_frames = 0;
        }
    }

    // Update IMU-smoothed rotation angle (same path the fallback face uses)
    face_update_rotation_smoothing(dt);

    // Blit canvas — skip the per-pixel rotation transform when the sketch
    // called noAutoRotate(), since identity pushRotateZoom costs ~15 ms/frame.
    LGFX_Sprite* cv = face_get_canvas();
    lgfx::LGFX_Device* lcd = face_get_lcd();
    if (cv && lcd) {
        uint32_t tb = millis();
        if (face_is_rotation_auto()) {
            cv->pushRotateZoom(lcd, 120, 120, face_get_rotation_angle(), 1.0f, 1.0f);
        } else {
            cv->pushSprite(lcd, 0, 0);
        }
        _last_blit_ms = millis() - tb;
    }

    // Quick GC opportunity between frames
    if ((_frame_count & 0x1F) == 0) mjs_gc(_m, 0);
}
