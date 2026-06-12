#pragma once
#include <Arduino.h>
#include <stddef.h>
#include <stdint.h>

// =============================================================================
// p5-ring sketch loader — FatFS + FatFSUSB + Serial UPLOAD protocol.
//
// Lifecycle:
//   sketch_loader_init()   — MUST be the first call in setup(). Mounts FatFS,
//                            starts USB MSC. Even if the rest of init crashes,
//                            the drive remains mountable for recovery.
//   sketch_loader_tick()   — call every loop(). Handles debounce + reload.
//
// Reload triggers (both fire the same callback):
//   • Host eject after a write that changed sketches/current.js
//   • Serial UPLOAD that targets SKETCH_PATH
//   • sketch_loader_force_reload() (Serial `sketch reload` command)
//
// The callback runs on the main loop, not in an interrupt context.
// =============================================================================

int   sketch_loader_init(void);
void  sketch_loader_tick(void);
bool  sketch_loader_host_connected(void);

// Reads up to max-1 bytes into buf, null-terminates. Returns bytes read, or
// -1 if the host has the drive mounted (unsafe to read) or on FS error.
int   sketch_loader_read(const char* path, char* buf, size_t max);
int   sketch_loader_size(const char* path);

// Writes raw bytes to path, creating parent dirs if needed. Used by Serial
// UPLOAD. -1 on error.
int   sketch_loader_write(const char* path, const char* buf, size_t len);

// Appends to an error log file (creates if needed). Used by sketch_vm to
// persist crash logs the user can read after popping the drive in.
int   sketch_loader_append_error(const char* path, const char* err);

typedef void (*sketch_reload_cb_t)(const char* path);
void  sketch_loader_on_reload(sketch_reload_cb_t cb);
void  sketch_loader_force_reload(void);

uint32_t sketch_loader_current_crc(void);

// Remove macOS dotfile spam — no-op in the LittleFS build (kept for ABI).
int   sketch_loader_clean_dotfiles(void);

// Copy `src_path` over `SKETCH_PATH` and fire a reload. Used by the
// `sketch use <name>` Serial command and the companion UI's example loader.
int   sketch_loader_copy_to_current(const char* src_path);

// Enumerate files in `dir`. For each match, fires `cb(name, size)`. Use this
// to implement `sketch list`. Returns count.
typedef void (*sketch_list_cb_t)(const char* name, size_t size, void* user);
int   sketch_loader_list(const char* dir, sketch_list_cb_t cb, void* user);
