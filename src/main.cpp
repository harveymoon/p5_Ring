// =============================================================================
// p5-ring — p5.js sketch runner on Waveshare RP2040-LCD-1.28
//
// PlatformIO env: [env:p5_ring]  (see platformio.ini)
//
// USB: composite CDC + MSC. The drive appears on the host as a FAT volume
// labeled "P5-RING" with a `sketches/` folder. Drop a .js file in, eject, the
// device reloads. CDC Serial (115200) stays alive alongside.
//
// Standalone reload  : host drag-and-drop + eject
// Dev-mode reload    : `tools/p5ring-watch/` Node companion pushes over Serial
//                       with the protocol  "UPLOAD <path> <len>\n<bytes>\nEND\n"
//
// Serial commands (one per line):
//   sketch on|off|reload|info  — control sketch runner
//   eject                       — programmatically remount the FS (for testing)
//   clean                       — delete macOS dotfile spam (.DS_Store etc.)
//   <face state name>           — force fallback face state (happy, sad, ...)
//   rotate 0|1|2|3|auto         — lock or auto-rotate
//   alert <message>             — show alert overlay
//   bright <0-255>              — backlight brightness
// =============================================================================

#include <Arduino.h>
#include <hardware/clocks.h>
#include "config.h"
#include "display_config.h"
#include "face.h"
#include "imu.h"
#include "sketch_loader.h"
#include "sketch_vm.h"
#include "error_overlay.h"
#include "settings.h"

static LGFX      lcd;
static uint32_t  last_frame_ms = 0;
static QSettings settings;

// ── USB Serial command buffer ────────────────────────────────────────────────
static char    _serial_buf[256];
static uint16_t _serial_len = 0;

// ── UPLOAD protocol state ────────────────────────────────────────────────────
//   "UPLOAD <path> <len>\n" then <len> raw bytes, then "\nEND\n"
static bool     _uploading       = false;
static char     _upload_path[64] = {0};
static uint32_t _upload_remain   = 0;
static char     _upload_buf[SKETCH_SRC_MAX];
static uint32_t _upload_written  = 0;

static void _on_sketch_reload(const char* path) {
    Serial.printf("[P5-RING] Reload trigger: %s\n", path);
    if (sketch_vm_load(path) == 0) {
        face_show_alert("Sketch reloaded |2000");
    } else {
        face_show_alert("Sketch error |3000");
    }
}

static void _handle_command(const char* cmd) {
    while (*cmd == ' ' || *cmd == '\r' || *cmd == '\n') cmd++;
    if (*cmd == '\0') return;

    if (strncmp(cmd, "sketch ", 7) == 0) {
        const char* arg = cmd + 7;
        if      (strcmp(arg, "on")     == 0) { sketch_vm_set_active(true);  Serial.println("[CMD] sketch -> on"); }
        else if (strcmp(arg, "off")    == 0) { sketch_vm_set_active(false); Serial.println("[CMD] sketch -> off (fallback face)"); }
        else if (strcmp(arg, "reload") == 0) { sketch_loader_force_reload(); Serial.println("[CMD] reload queued"); }
        else if (strcmp(arg, "info")   == 0) {
            Serial.printf("[INFO] active=%d  error=%d  crc=0x%08lx  heap_free=%u  draw_ms=%u  blit_ms=%u\n",
                (int)sketch_vm_active(), (int)sketch_vm_has_error(),
                (unsigned long)sketch_loader_current_crc(), sketch_vm_heap_free(),
                (unsigned)sketch_vm_last_dt_ms(), (unsigned)sketch_vm_last_blit_ms());
            if (sketch_vm_has_error()) Serial.printf("[INFO] last_error: %s\n", sketch_vm_error_text());
        }
        else if (strcmp(arg, "list") == 0) {
            Serial.println("[LIST]");
            sketch_loader_list("/sketches/examples",
                [](const char* name, size_t sz, void*){
                    Serial.printf("[LIST] examples/%s  %u\n", name, (unsigned)sz);
                }, nullptr);
            Serial.println("[LIST] end");
        }
        else if (strncmp(arg, "use ", 4) == 0) {
            const char* nm = arg + 4;
            char path[80];
            if (nm[0] == '/') strncpy(path, nm, sizeof(path) - 1);
            else snprintf(path, sizeof(path), "/sketches/examples/%s", nm);
            path[sizeof(path) - 1] = '\0';
            int rc = sketch_loader_copy_to_current(path);
            if (rc < 0) Serial.printf("[CMD] sketch use: cannot read %s\n", path);
            else        Serial.printf("[CMD] sketch use: %s (%d bytes) — reload queued\n", path, rc);
        }
        else Serial.printf("[CMD] unknown sketch subcommand: %s\n", arg);
        return;
    }

    if (strcmp(cmd, "eject") == 0) {
        sketch_loader_force_reload();
        return;
    }
    if (strcmp(cmd, "spi_test") == 0) {
        LGFX_Sprite* cv = face_get_canvas();
        lgfx::LGFX_Device* lcd = face_get_lcd();
        uint32_t t0 = millis();
        for (int i = 0; i < 8; i++) lcd->fillScreen(0x0000);
        uint32_t fill_ms = (millis() - t0) / 8;
        t0 = millis();
        for (int i = 0; i < 8; i++) cv->pushSprite(lcd, 0, 0);
        uint32_t push_ms = (millis() - t0) / 8;
        // Implied SPI MHz from pushSprite: 115200 bytes * 8 bits / push_ms
        uint32_t implied_khz = (push_ms > 0) ? (115200UL * 8UL / push_ms) : 0;
        uint32_t peri_hz = clock_get_hz(clk_peri);
        Serial.printf("[SPI_TEST] fillScreen=%lums  pushSprite=%lums  implied_SPI~%lukHz  clk_peri=%luMHz\n",
            (unsigned long)fill_ms, (unsigned long)push_ms,
            (unsigned long)implied_khz, (unsigned long)(peri_hz / 1000000));
        return;
    }
    if (strcmp(cmd, "clean") == 0) {
        int n = sketch_loader_clean_dotfiles();
        Serial.printf("[CMD] removed %d dotfile(s)\n", n);
        return;
    }

    // NOTE: `rotate` is no longer a Serial command. Canvas rotation is now
    //   sketch-controlled (autoRotate() / noAutoRotate() in JS). The fallback
    //   face still IMU-rotates as a device-level default.

    if (strncmp(cmd, "alert ", 6) == 0) { face_show_alert(cmd + 6); return; }

    if (strncmp(cmd, "color ", 6) == 0) {
        const char* h = cmd + 6;
        while (*h == '#' || *h == ' ') h++;
        if (strlen(h) < 6) { Serial.println("[CMD] color: need 6 hex digits, e.g. color FFA500"); return; }
        unsigned long v = strtoul(h, nullptr, 16);
        settings.accent_r = (uint8_t)((v >> 16) & 0xFF);
        settings.accent_g = (uint8_t)((v >>  8) & 0xFF);
        settings.accent_b = (uint8_t)( v        & 0xFF);
        face_set_accent(settings.accent_r, settings.accent_g, settings.accent_b);
        settings_save(&settings);
        Serial.printf("[CMD] color -> #%02X%02X%02X (saved)\n",
                      settings.accent_r, settings.accent_g, settings.accent_b);
        return;
    }

    if (strncmp(cmd, "bright ", 7) == 0) {
        int v = atoi(cmd + 7);
        // The LovyanGFX RP2040 backlight driver hardcodes pwm_set_wrap(100),
        // so any value > 100 saturates as full-on. Clamp to the useful range.
        if (v < 0) v = 0; if (v > 100) v = 100;
        settings.brightness = (uint8_t)v;
        face_set_brightness(settings.brightness);
        settings_save(&settings);
        Serial.printf("[CMD] bright -> %d (saved)\n", v);
        return;
    }

    FaceState s = face_state_from_string(cmd);
    if (s != (FaceState)0xFF) {
        settings.face_state = s;
        face_set_state(s);
        settings_save(&settings);
    } else {
        Serial.printf("[CMD] unknown: \"%s\"\n", cmd);
    }
}

// Try to parse "UPLOAD <path> <len>" out of the line buffer; on success return
// true and set _uploading + _upload_remain + _upload_path.
static bool _try_upload_header(const char* line) {
    if (strncmp(line, "UPLOAD ", 7) != 0) return false;
    const char* p = line + 7;
    const char* sp = strchr(p, ' ');
    if (!sp) return false;
    size_t plen = (size_t)(sp - p);
    if (plen >= sizeof(_upload_path)) return false;
    memcpy(_upload_path, p, plen);
    _upload_path[plen] = '\0';
    uint32_t n = (uint32_t)atol(sp + 1);
    if (n == 0 || n > SKETCH_SRC_MAX) return false;
    _uploading      = true;
    _upload_remain  = n;
    _upload_written = 0;
    Serial.printf("[UPLOAD] receiving %lu bytes -> %s\n", (unsigned long)n, _upload_path);
    return true;
}

static void _serial_tick() {
    while (Serial.available()) {
        char c = (char)Serial.read();

        // Mid-upload: consume raw bytes
        if (_uploading) {
            if (_upload_remain > 0) {
                _upload_buf[_upload_written++] = c;
                _upload_remain--;
                if (_upload_remain == 0) {
                    Serial.println("[UPLOAD] body complete, waiting for END");
                }
                continue;
            }
            // After body: expect "\nEND\n"
            if (_serial_len < sizeof(_serial_buf) - 1) _serial_buf[_serial_len++] = c;
            _serial_buf[_serial_len] = '\0';
            if (strstr(_serial_buf, "END") != nullptr) {
                int rc = sketch_loader_write(_upload_path, _upload_buf, _upload_written);
                if (rc < 0) {
                    Serial.printf("[UPLOAD] FAIL writing %s\n", _upload_path);
                } else {
                    Serial.printf("[UPLOAD] OK %d bytes -> %s\n", rc, _upload_path);
                    if (strcmp(_upload_path, SKETCH_PATH) == 0) sketch_loader_force_reload();
                }
                _uploading = false;
                _serial_len = 0;
            }
            continue;
        }

        if (c == '\n' || c == '\r') {
            if (_serial_len > 0) {
                _serial_buf[_serial_len] = '\0';
                if (!_try_upload_header(_serial_buf)) _handle_command(_serial_buf);
                _serial_len = 0;
            }
        } else if (_serial_len < sizeof(_serial_buf) - 1) {
            _serial_buf[_serial_len++] = c;
        }
    }
}

// =============================================================================

// SAFE-MODE: skip FatFS/FatFSUSB/mJS to isolate the boot-hang. Define this in
// platformio.ini build_flags to bypass the FS path. Once we confirm the face
// runs in safe mode, we re-enable FS one piece at a time.
#ifndef P5RING_SAFE_MODE
#define P5RING_SAFE_MODE 0
#endif

void setup() {
    // clk_peri defaults to 48 MHz (USB PLL) in this Arduino build, capping SPI
    // at 24 MHz. Re-source from clk_sys (125 MHz) before any peripheral init so
    // SPI reaches 62.5 MHz. USB is unaffected — it runs on clk_usb separately.
    {
        uint32_t sys_hz = clock_get_hz(clk_sys);
        clock_configure(clk_peri, 0,
                        CLOCKS_CLK_PERI_CTRL_AUXSRC_VALUE_CLK_SYS,
                        sys_hz, sys_hz);
    }

    Serial.begin(115200);
    delay(3000);

    Serial.println("\n[P5-RING] Booting...");
    Serial.flush();

#if !P5RING_SAFE_MODE
    Serial.println("[P5-RING] step A: sketch_loader_init()"); Serial.flush();
    int rc = sketch_loader_init();
    Serial.printf("[P5-RING]   -> rc=%d\n", rc); Serial.flush();
    sketch_loader_on_reload(_on_sketch_reload);
#else
    Serial.println("[P5-RING] SAFE MODE: skipping FS + USB MSC"); Serial.flush();
#endif

    Serial.println("[P5-RING] step B: lcd.init()"); Serial.flush();
    lcd.init();
    lcd.setRotation(0);
    lcd.fillScreen(0x0000);
    Serial.println("[P5-RING]   -> ok"); Serial.flush();

    Serial.println("[P5-RING] step C: face_init() + load settings"); Serial.flush();
    face_init(&lcd);
    settings_load(&settings);    // brightness + face state from /sketches/.settings
    settings_apply(&settings);   // applies both immediately
    Serial.println("[P5-RING]   -> ok"); Serial.flush();

    Serial.println("[P5-RING] step D: imu_init()"); Serial.flush();
    imu_init();
    Serial.println("[P5-RING]   -> ok"); Serial.flush();

#if !P5RING_SAFE_MODE
    Serial.println("[P5-RING] step E: sketch_vm_init()"); Serial.flush();
    sketch_vm_init();
    Serial.println("[P5-RING] step F: sketch_vm_load()"); Serial.flush();
    if (sketch_vm_load(SKETCH_PATH) == 0) {
        Serial.printf("[P5-RING] Sketch loaded: %s\n", SKETCH_PATH);
    } else {
        Serial.println("[P5-RING] No valid sketch — fallback face active");
    }
#endif

    Serial.println("[P5-RING] Ready.");
    Serial.flush();
}

void loop() {
    uint32_t now = millis();

    imu_tick();
    sketch_loader_tick();
    _serial_tick();

    if (now - last_frame_ms >= FRAME_BUDGET_MS) {
        last_frame_ms = now;

        if (sketch_vm_active() && !sketch_vm_has_error()) {
            sketch_vm_tick();
        } else if (sketch_vm_has_error()) {
            // Render error overlay briefly, then fallback face takes over.
            if (error_overlay_should_show(now)) error_overlay_draw(now);
            else                                face_tick();
        } else {
            face_tick();
        }
    }
}
