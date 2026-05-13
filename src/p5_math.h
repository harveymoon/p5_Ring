#pragma once
#include <stdint.h>

// xorshift32 — deterministic-feel, fast, seeded once at boot
void   p5m_seed(uint32_t s);
float  p5m_random_unit(void);
float  p5m_random_range(float lo, float hi);

// Classic Ken Perlin (1D/2D/3D — fed through the 3D path with y=z=0)
float  p5m_noise3(float x, float y, float z);

// Helpers
float  p5m_map(float v, float a, float b, float c, float d);
float  p5m_lerp(float a, float b, float t);
float  p5m_dist(float x1, float y1, float x2, float y2);
float  p5m_constrain(float v, float lo, float hi);
