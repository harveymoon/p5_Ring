#pragma once
#include <stdint.h>
#include "face.h"

// Per-device persistent settings, stored in LittleFS at /sketches/.settings
// (plain key=value text — easy to inspect over Serial if needed).

struct QSettings {
    uint8_t   brightness;    // 0-100 (RP2040 backlight wraps at 100)
    FaceState face_state;    // last face state the user picked
    uint8_t   accent_r;      // face accent color, 0-255 per channel
    uint8_t   accent_g;
    uint8_t   accent_b;
};

void settings_defaults(QSettings* s);
void settings_load(QSettings* s);
int  settings_save(const QSettings* s);

// Apply both to the hardware (backlight + face state).
void settings_apply(const QSettings* s);
