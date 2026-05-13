#include "settings.h"
#include "config.h"
#include <Arduino.h>
#include <LittleFS.h>
#include <string.h>
#include <stdlib.h>

#define SETTINGS_PATH "/sketches/.settings"

void settings_defaults(QSettings* s) {
    // RP2040 backlight tops out at PWM 100 (LovyanGFX wraps the counter at
    // 100), so the useful brightness range is 0..100. Default to ~80% bright.
    s->brightness = 80;
    s->face_state = STANDBY_FACE_STATE;
    // Default accent matches the original cyan face.
    s->accent_r = 0;
    s->accent_g = 200;
    s->accent_b = 255;
}

void settings_load(QSettings* s) {
    settings_defaults(s);

    File f = LittleFS.open(SETTINGS_PATH, "r");
    if (!f) return;
    char buf[256];
    size_t n = f.read((uint8_t*)buf, sizeof(buf) - 1);
    f.close();
    buf[n] = '\0';

    // Walk key=value lines.
    char* save = nullptr;
    for (char* line = strtok_r(buf, "\r\n", &save); line;
              line  = strtok_r(nullptr, "\r\n", &save)) {
        char* eq = strchr(line, '=');
        if (!eq) continue;
        *eq = '\0';
        const char* val = eq + 1;
        if (strcmp(line, "brightness") == 0) {
            int v = atoi(val);
            if (v < 0)   v = 0;
            if (v > 100) v = 100;
            s->brightness = (uint8_t)v;
        } else if (strcmp(line, "face") == 0) {
            s->face_state = face_state_from_string(val);
        } else if (strcmp(line, "accent") == 0) {
            // RRGGBB hex, optionally with leading '#'
            const char* h = val;
            if (*h == '#') h++;
            unsigned long v = strtoul(h, nullptr, 16);
            s->accent_r = (uint8_t)((v >> 16) & 0xFF);
            s->accent_g = (uint8_t)((v >>  8) & 0xFF);
            s->accent_b = (uint8_t)( v        & 0xFF);
        }
    }
    Serial.printf("[SETTINGS] loaded: brightness=%u face=%s\n",
                  s->brightness, face_state_to_string(s->face_state));
}

int settings_save(const QSettings* s) {
    File f = LittleFS.open(SETTINGS_PATH, "w");
    if (!f) return -1;
    char buf[128];
    int n = snprintf(buf, sizeof(buf),
                     "brightness=%u\nface=%s\naccent=%02X%02X%02X\n",
                     s->brightness, face_state_to_string(s->face_state),
                     s->accent_r, s->accent_g, s->accent_b);
    f.write((const uint8_t*)buf, n);
    f.close();
    return n;
}

void settings_apply(const QSettings* s) {
    face_set_brightness(s->brightness);
    // Apply accent BEFORE face_set_state so the state target params pick up
    // the new color.
    face_set_accent(s->accent_r, s->accent_g, s->accent_b);
    face_set_state(s->face_state);
}
