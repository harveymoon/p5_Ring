#pragma once
#include <stdint.h>

// =============================================================================
// p5-ring — QMI8658 accelerometer → auto-rotation + accel exposed to p5
// =============================================================================

void    imu_init();
void    imu_tick();
bool    imu_is_ok();
uint8_t imu_get_rotation();
void    imu_lock_rotation(int8_t r);
float   imu_get_ax();
float   imu_get_ay();
float   imu_get_az();   // Z axis — exposed to sketches as `accelZ`
