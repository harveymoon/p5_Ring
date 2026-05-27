#pragma once
#include <LovyanGFX.hpp>

// =============================================================================
// Q-Ring — Fallback animated face.
//
// Q-Ring fallback face engine. When a p5 sketch is
// loaded and running cleanly the face is bypassed; on boot-without-sketch, on
// sketch error, or on watchdog overrun the face becomes the standby render.
// Default state is HAPPY (see STANDBY_FACE_STATE in config.h).
//
// face_get_canvas() and face_get_rotation_angle() are exposed so the p5
// bindings can share the same 115 KB LGFX_Sprite and the same IMU-smoothed
// rotation angle — there is only one of each in the build.
// =============================================================================

enum class FaceState : uint8_t {
    IDLE, THINKING, LISTENING, HAPPY, SAD,
    SURPRISED, SLEEPING, SPEAKING, ANGRY, CALIBRATE,
};

FaceState   face_state_from_string(const char* s);
const char* face_state_to_string(FaceState s);

void      face_init(lgfx::LGFX_Device* lcd);
void      face_set_state(FaceState s);
FaceState face_get_state();
void      face_tick();

void face_show_alert(const char* msg_or_pipe, uint32_t default_duration_ms = 5000);
void face_dismiss_alert();
bool face_alert_active();

void face_set_brightness(uint8_t v);
void face_set_rotation(uint8_t r);
void face_set_rotation_auto(bool enable);
bool face_is_rotation_auto();

// Set the face's accent color (iris / brow / mouth / sleeping / listening
// pulse). Triggers a re-apply of the current state so the transition is
// animated. Defaults to cyan (0, 200, 255).
void    face_set_accent(uint8_t r, uint8_t g, uint8_t b);
uint8_t face_get_accent_r();
uint8_t face_get_accent_g();
uint8_t face_get_accent_b();

// --- Shared resources for the p5 bindings ---
LGFX_Sprite*       face_get_canvas();          // the single 240x240 RGB565 sprite
lgfx::LGFX_Device* face_get_lcd();             // the underlying panel
float              face_get_rotation_angle();  // IMU-smoothed degrees
void               face_update_rotation_smoothing(float dt);  // run by sketch_tick when face is bypassed
