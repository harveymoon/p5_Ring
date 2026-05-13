#pragma once

// Baked-in example sketches. Seeded into /sketches/examples/ on first boot
// (or whenever a file is missing) so the device always ships with content.
//
// Each pair is { device_path, source_text }. Path is relative to the LittleFS
// root. NULL terminates the list.

struct DefaultExample { const char* path; const char* src; };

extern const DefaultExample DEFAULT_EXAMPLES[];
