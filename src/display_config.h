#pragma once

// =============================================================================
// Q-Ring — LovyanGFX display class
// GC9A01A 240x240 round IPS via SPI1
// =============================================================================

#define LGFX_USE_V1
#include <LovyanGFX.hpp>
#include "config.h"

class LGFX : public lgfx::LGFX_Device {
public:
    lgfx::Panel_GC9A01  _panel_instance;
    lgfx::Bus_SPI       _bus_instance;
    lgfx::Light_PWM     _light_instance;

    LGFX() {
        {
            auto cfg = _bus_instance.config();
            cfg.freq_write  = 80000000;
            cfg.freq_read   = 20000000;
            cfg.pin_sclk    = PIN_LCD_CLK;
            cfg.pin_mosi    = PIN_LCD_DIN;
            cfg.pin_miso    = -1;
            cfg.pin_dc      = PIN_LCD_DC;
            _bus_instance.config(cfg);
            _panel_instance.setBus(&_bus_instance);
        }
        {
            auto cfg = _panel_instance.config();
            cfg.pin_cs           = PIN_LCD_CS;
            cfg.pin_rst          = PIN_LCD_RST;
            cfg.pin_busy         = -1;
            cfg.panel_width      = DISPLAY_WIDTH;
            cfg.panel_height     = DISPLAY_HEIGHT;
            cfg.memory_width     = DISPLAY_WIDTH;
            cfg.memory_height    = DISPLAY_HEIGHT;
            cfg.offset_x         = 0;
            cfg.offset_y         = 0;
            cfg.offset_rotation  = 0;
            cfg.readable         = false;
            cfg.invert           = true;
            cfg.rgb_order        = false;
            cfg.dlen_16bit       = false;
            cfg.bus_shared       = false;
            _panel_instance.config(cfg);
        }
        {
            auto cfg = _light_instance.config();
            cfg.pin_bl      = PIN_LCD_BL;
            cfg.invert      = false;
            cfg.freq        = 44100;
            cfg.pwm_channel = 7;
            _light_instance.config(cfg);
        }
        _panel_instance.light(&_light_instance);
        setPanel(&_panel_instance);
    }
};
