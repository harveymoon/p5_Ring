#pragma once

// =============================================================================
// p5-ring — Configuration
// Waveshare RP2040-LCD-1.28  (240x240 round IPS, GC9A01A SPI)
//
// PlatformIO env: [env:p5_ring] in platformio.ini.
// USB exposes both CDC (Serial @ 115200) and MSC (FatFS drive labeled "P5-RING").
// =============================================================================

#include "face.h"   // for FaceState in STANDBY_FACE_STATE

// --- Display ---
#define DISPLAY_WIDTH   240
#define DISPLAY_HEIGHT  240

// --- Pins (Waveshare RP2040-LCD-1.28 schematic) ---
//   The Arduino IDE Waveshare board variant exposed these in pins_arduino.h
//   but the generic PlatformIO `pico` board doesn't, so we declare them here.
#define PIN_LCD_CLK  10
#define PIN_LCD_DIN  11
#define PIN_LCD_DC   8
#define PIN_LCD_CS   9
#define PIN_LCD_RST  12
#define PIN_LCD_BL   25
#define PIN_IMU_SDA  6
#define PIN_IMU_SCL  7

// --- Animation ---
#define TARGET_FPS      30
#define FRAME_BUDGET_MS (1000 / TARGET_FPS)

// --- Sketch runner ---
#define SKETCH_HEAP_BYTES         (80 * 1024)
#define SKETCH_SRC_MAX            8192
#define SKETCH_WATCHDOG_MS        700
#define SKETCH_PATH               "/sketches/current.js"
#define SKETCH_ERROR_DIR          "/sketches/.errors"
#define SKETCH_ERROR_LAST         "/sketches/.errors/last.log"
#define SKETCH_RELOAD_DEBOUNCE_MS 250
#define DRIVE_LABEL               "P5-RING"
#define STANDBY_FACE_STATE        FaceState::HAPPY
