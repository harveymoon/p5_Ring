#pragma once
#include <stdint.h>

// Forward decl — mjs is in the vendor C TU; we don't pull its header here
// to avoid polluting compile times. p5_bindings.cpp does include it.
struct mjs;

// Install C-side FFI bindings only. The JS prelude (let _bg = ffi(...); function
// background(){}; ...) is returned separately so sketch_vm can prepend it to
// the user source in a single mjs_exec call. (Defining functions in one exec
// and calling them from another doesn't carry forward in mJS.)
void p5_bindings_install(struct mjs* m);
const char* p5_bindings_prelude_js(void);

// Reset transform/fill/stroke/text state at the start of each draw().
void p5_bindings_reset_state(void);

// Update the sketch-visible globals (frameCount, millis(), accelX/Y/Z).
void p5_bindings_update_globals(struct mjs* m, uint32_t frame_count);
