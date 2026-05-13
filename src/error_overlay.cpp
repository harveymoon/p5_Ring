#include "error_overlay.h"
#include "sketch_vm.h"
#include "face.h"
#include <Arduino.h>
#include <LovyanGFX.hpp>
#include <string.h>

static uint32_t _armed_ms = 0;
static bool     _was_armed_for_text = false;
static char     _last_text[256] = {0};

void error_overlay_arm(uint32_t now) { _armed_ms = now; _was_armed_for_text = false; }

bool error_overlay_should_show(uint32_t now) {
    // Auto-arm the first time we observe a new error
    const char* t = sketch_vm_error_text();
    if (t && strcmp(t, _last_text) != 0) {
        strncpy(_last_text, t, sizeof(_last_text) - 1);
        _last_text[sizeof(_last_text) - 1] = '\0';
        _armed_ms = now;
        _was_armed_for_text = true;
    }
    if (!_was_armed_for_text) return false;
    return (now - _armed_ms) < ERROR_FLASH_MS;
}

void error_overlay_draw(uint32_t now) {
    LGFX_Sprite* cv = face_get_canvas();
    lgfx::LGFX_Device* lcd = face_get_lcd();
    if (!cv || !lcd) return;

    cv->fillScreen(0x0000);  // black

    // Red banner
    cv->fillRoundRect(10, 90, 220, 60, 6, 0x7800);
    cv->drawRoundRect(10, 90, 220, 60, 6, 0xF800);

    cv->setTextSize(2);
    cv->setTextColor(0xFFFF);
    cv->setCursor(64, 100);
    cv->print("SKETCH");
    cv->setCursor(78, 120);
    cv->print("ERROR");

    // Error text scroll (one line, simple horizontal march)
    cv->setTextSize(1);
    cv->setTextColor(0xFFFF);
    const char* t = sketch_vm_error_text();
    int tw = (int)cv->textWidth(t);
    int total = tw + 240;
    int pos = (int)((now / 25) % total);
    cv->setCursor(240 - pos, 165);
    cv->print(t);

    cv->setTextSize(1);
    cv->setTextColor(0xAAAA);
    cv->setCursor(54, 195);
    cv->print("see /sketches/.errors/");

    cv->pushRotateZoom(lcd, 120, 120, face_get_rotation_angle(), 1.0f, 1.0f);
}
