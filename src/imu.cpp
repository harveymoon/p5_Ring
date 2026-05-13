#include "imu.h"
#include "config.h"
#include "face.h"
#include <Wire.h>
#include <Arduino.h>

#define QMI_CTRL1  0x02
#define QMI_CTRL2  0x03
#define QMI_CTRL5  0x06
#define QMI_CTRL7  0x08
#define QMI_AX_L   0x35

#define QMI_ADDR_L  0x6A
#define QMI_ADDR_H  0x6B
static uint8_t QMI_ADDR = QMI_ADDR_L;

static bool     _ok       = false;
static uint8_t  _rotation = 0;
static int8_t   _locked   = -1;
static uint32_t _next_ms  = 0;
static float    _ax       = 0, _ay = 0, _az = 0;

static void _wr(uint8_t reg, uint8_t val) {
  Wire1.beginTransmission(QMI_ADDR);
  Wire1.write(reg);
  Wire1.write(val);
  Wire1.endTransmission();
}

static void _rd(uint8_t reg, uint8_t* buf, uint8_t len) {
  Wire1.beginTransmission(QMI_ADDR);
  Wire1.write(reg);
  Wire1.endTransmission();
  Wire1.requestFrom(QMI_ADDR, len);
  for (uint8_t i = 0; i < len; i++) buf[i] = Wire1.read();
  Wire1.endTransmission();
}

void imu_init() {
  Wire1.setSDA(PIN_IMU_SDA);
  Wire1.setSCL(PIN_IMU_SCL);
  Wire1.setClock(400000);
  Wire1.begin();

  bool found = false;
  for (uint8_t candidate : { QMI_ADDR_L, QMI_ADDR_H }) {
    QMI_ADDR = candidate;
    Wire1.beginTransmission(QMI_ADDR);
    if (Wire1.endTransmission() == 0) { found = true; break; }
  }
  if (!found) {
    Serial.println("[IMU] QMI8658 not found — auto-rotation disabled");
    _ok = false;
    return;
  }

  uint8_t id = 0;
  _rd(0x00, &id, 1);
  Serial.printf("[IMU] QMI8658 at 0x%02X  WHO_AM_I=0x%02X\n", QMI_ADDR, id);
  if (id != 0x05) {
    Serial.println("[IMU] unexpected WHO_AM_I — auto-rotation disabled");
    _ok = false;
    return;
  }

  _wr(QMI_CTRL1, 0x60);
  _wr(QMI_CTRL2, 0x23);
  _wr(QMI_CTRL5, 0x00);
  _wr(QMI_CTRL7, 0x03);

  _ok = true;
  Serial.println("[IMU] QMI8658 ready — 8G / 1000 Hz");
}

bool    imu_is_ok()        { return _ok; }
uint8_t imu_get_rotation() { return _rotation; }
float   imu_get_ax()       { return _ax; }
float   imu_get_ay()       { return _ay; }
float   imu_get_az()       { return _az; }

void imu_lock_rotation(int8_t r) {
  _locked = r;
  if (r >= 0 && r <= 3) {
    _rotation = (uint8_t)r;
    face_set_rotation(_rotation);
  } else {
    face_set_rotation_auto(true);
  }
}

void imu_tick() {
  if (!_ok || millis() < _next_ms) return;
  _next_ms = millis() + 50;

  uint8_t buf[6];
  _rd(QMI_AX_L, buf, 6);

  float ax_raw = (float)(int16_t)((buf[1] << 8) | buf[0]) * (8.0f / 32768.0f);
  float ay_raw = (float)(int16_t)((buf[3] << 8) | buf[2]) * (8.0f / 32768.0f);
  float az_raw = (float)(int16_t)((buf[5] << 8) | buf[4]) * (8.0f / 32768.0f);

  _ax = 0.8f * _ax + 0.2f * ax_raw;
  _ay = 0.8f * _ay + 0.2f * ay_raw;
  _az = 0.8f * _az + 0.2f * az_raw;

  if (_locked >= 0) return;

  const float T = 0.6f;
  uint8_t new_rot = _rotation;
  if      (_ay < -T) new_rot = 0;
  else if (_ax >  T) new_rot = 1;
  else if (_ay >  T) new_rot = 2;
  else if (_ax < -T) new_rot = 3;

  if (new_rot != _rotation) {
    _rotation = new_rot;
    Serial.printf("[IMU] rotation -> %d  (ax=%.2f  ay=%.2f)\n", _rotation, _ax, _ay);
  }
}
