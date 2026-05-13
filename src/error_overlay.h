#pragma once
#include <stdint.h>

// Red error overlay drawn into the shared canvas for ERROR_FLASH_MS after a
// sketch fails. After the flash window, the dispatcher in main.cpp falls back
// to face_tick() — the device is never visibly broken.

#define ERROR_FLASH_MS 3000

void error_overlay_arm(uint32_t now);
bool error_overlay_should_show(uint32_t now);
void error_overlay_draw(uint32_t now);
