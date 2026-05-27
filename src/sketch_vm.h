#pragma once
#include <stdint.h>
#include <stddef.h>

// =============================================================================
// Q-Ring sketch VM — mJS engine + p5 bindings + watchdog.
//
// Lifecycle:
//   sketch_vm_init()           — once, in setup(), AFTER face_init().
//   sketch_vm_load(path)       — reads + execs a sketch from FatFS, calls setup().
//   sketch_vm_tick()           — call once per frame; runs draw() with watchdog.
//
// On any error (parse, runtime, watchdog) the VM:
//   - records error text + position
//   - persists log to SKETCH_ERROR_LAST
//   - marks itself errored — main.cpp dispatcher falls back to face_tick().
// =============================================================================

int  sketch_vm_init(void);
int  sketch_vm_load(const char* path);   // 0=ok, <0=error (also marks errored)
void sketch_vm_tick(void);

bool sketch_vm_active(void);
void sketch_vm_set_active(bool on);

bool        sketch_vm_has_error(void);
const char* sketch_vm_error_text(void);
void        sketch_vm_clear_error(void);

uint32_t sketch_vm_heap_free(void);
uint32_t sketch_vm_last_dt_ms(void);
uint32_t sketch_vm_last_blit_ms(void);
